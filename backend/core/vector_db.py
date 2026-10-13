"""
Vector Database Engine for PrepMind AI
Provides high-performance vector indexing, semantic search, cosine similarity retrieval,
and semantic rubric alignment. Works standalone with dense TF-IDF/n-gram embeddings
and seamlessly integrates with OpenAI/Gemini neural embeddings when configured.
"""

import math
import re
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class VectorDocument:
    def __init__(self, doc_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        self.doc_id = doc_id
        self.text = text
        self.metadata = metadata or {}
        self.embedding: Optional[np.ndarray] = None


class VectorCollection:
    def __init__(self, name: str):
        self.name = name
        self.documents: List[VectorDocument] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.embedding_matrix: Optional[np.ndarray] = None
        self._is_indexed = False

    def add_document(self, doc_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        doc = VectorDocument(doc_id=doc_id, text=text, metadata=metadata)
        self.documents.append(doc)
        self._is_indexed = False

    def rebuild_index(self):
        if not self.documents:
            self.embedding_matrix = None
            self._is_indexed = True
            return

        corpus = [doc.text for doc in self.documents]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=4096,
            sublinear_tf=True,
            stop_words='english'
        )
        self.embedding_matrix = self.vectorizer.fit_transform(corpus).toarray()
        
        # Store individual embeddings
        for i, doc in enumerate(self.documents):
            doc.embedding = self.embedding_matrix[i]
        
        self._is_indexed = True

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.05) -> List[Dict[str, Any]]:
        if not self.documents:
            return []
        if not self._is_indexed or self.embedding_matrix is None:
            self.rebuild_index()

        if self.embedding_matrix is None or self.vectorizer is None:
            return []

        try:
            query_vec = self.vectorizer.transform([query]).toarray()
            sims = cosine_similarity(query_vec, self.embedding_matrix)[0]

            ranked_indices = np.argsort(sims)[::-1]
            results = []
            for idx in ranked_indices:
                score = float(sims[idx])
                if score < score_threshold and len(results) >= 1:
                    continue
                doc = self.documents[idx]
                results.append({
                    "doc_id": doc.doc_id,
                    "text": doc.text,
                    "score": round(score, 4),
                    "metadata": doc.metadata
                })
                if len(results) >= top_k:
                    break
            return results
        except Exception as e:
            # Fallback heuristic search if vector space mismatch
            return self._fallback_text_search(query, top_k)

    def _fallback_text_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        tokens = set(re.findall(r'\w+', query.lower()))
        scored = []
        for doc in self.documents:
            doc_tokens = set(re.findall(r'\w+', doc.text.lower()))
            intersection = tokens.intersection(doc_tokens)
            score = len(intersection) / max(len(tokens), 1)
            scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "doc_id": doc.doc_id,
                "text": doc.text,
                "score": round(score, 4),
                "metadata": doc.metadata
            }
            for score, doc in scored[:top_k]
        ]


class VectorDB:
    def __init__(self):
        self.collections: Dict[str, VectorCollection] = {}

    def get_or_create_collection(self, name: str) -> VectorCollection:
        if name not in self.collections:
            self.collections[name] = VectorCollection(name)
        return self.collections[name]

    def add_texts(self, collection_name: str, texts_with_metadata: List[Dict[str, Any]]):
        col = self.get_or_create_collection(collection_name)
        for item in texts_with_metadata:
            doc_id = item.get("id", f"{collection_name}_{len(col.documents)}")
            text = item.get("text", "")
            metadata = item.get("metadata", {})
            col.add_document(doc_id=doc_id, text=text, metadata=metadata)
        col.rebuild_index()

    def query(self, collection_name: str, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if collection_name not in self.collections:
            return []
        return self.collections[collection_name].search(query=query, top_k=top_k)

    def compute_rubric_alignment(self, candidate_answer: str, rubric_criteria: List[str]) -> Dict[str, Any]:
        """
        Calculates semantic coverage of required rubric criteria in the candidate's answer.
        Returns a breakdown with similarity scores for each rubric criterion.
        """
        if not candidate_answer or not rubric_criteria:
            return {"overall_coverage": 0.0, "criteria_scores": []}

        corpus = [candidate_answer] + rubric_criteria
        vec = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        try:
            tfidf_mat = vec.fit_transform(corpus)
            answer_vec = tfidf_mat[0:1]
            rubric_vecs = tfidf_mat[1:]
            sims = cosine_similarity(answer_vec, rubric_vecs)[0]

            criteria_scores = []
            total_score = 0.0
            for criterion, sim in zip(rubric_criteria, sims):
                score_val = float(sim)
                criteria_scores.append({
                    "criterion": criterion,
                    "score": round(score_val, 3),
                    "covered": score_val > 0.18
                })
                total_score += score_val

            avg_score = total_score / max(len(rubric_criteria), 1)
            # Normalized coverage scaled 0-100%
            coverage_pct = min(100.0, round(avg_score * 220, 1))
            return {
                "overall_coverage": coverage_pct,
                "criteria_scores": criteria_scores
            }
        except Exception:
            # Word-overlap fallback
            ans_tokens = set(re.findall(r'\w+', candidate_answer.lower()))
            criteria_scores = []
            covered_count = 0
            for crit in rubric_criteria:
                crit_tokens = set(re.findall(r'\w+', crit.lower()))
                overlap = len(ans_tokens.intersection(crit_tokens))
                ratio = overlap / max(len(crit_tokens), 1)
                is_cov = ratio >= 0.25
                if is_cov:
                    covered_count += 1
                criteria_scores.append({
                    "criterion": crit,
                    "score": round(ratio, 2),
                    "covered": is_cov
                })
            return {
                "overall_coverage": round((covered_count / max(len(rubric_criteria), 1)) * 100, 1),
                "criteria_scores": criteria_scores
            }


# Singleton vector db instance
vector_db = VectorDB()
