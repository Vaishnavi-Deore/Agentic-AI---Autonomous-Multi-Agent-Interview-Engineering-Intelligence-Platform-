"""
Interviewer Persona Agent for PrepMind AI
Implements persona dynamics (Alex, Elena, Marcus, Sophia),
contextual question delivery, and Socratic probing.
"""

from typing import Dict, Any, List
from ..llm_engine import llm_engine


INTERVIEWER_PERSONAS = {
    "alex": {
        "name": "Alex Vance",
        "title": "Principal Architect & Bar Raiser",
        "style": "Rigorous, analytical, focused on scalability, edge cases, and high-concurrency trade-offs.",
        "avatar": "architect"
    },
    "elena": {
        "name": "Elena Rostova",
        "title": "Director of Engineering",
        "style": "Behavioral leadership, STAR method scrutiny, team dynamics, cross-functional conflict, and business alignment.",
        "avatar": "director"
    },
    "marcus": {
        "name": "Marcus Kane",
        "title": "Algorithmic Specialist & Tech Lead",
        "style": "Deep focus on time/space complexity, data structures, clean code, and edge case resilience.",
        "avatar": "algorithms"
    },
    "sophia": {
        "name": "Sophia Martinez",
        "title": "FAANG Career Coach & Senior Mentor",
        "style": "Empathetic, structured, uses Socratic hints to guide candidates through challenging concepts.",
        "avatar": "mentor"
    }
}


class InterviewerAgent:
    def __init__(self, persona_key: str = "alex"):
        self.set_persona(persona_key)

    def set_persona(self, persona_key: str):
        self.persona_key = persona_key if persona_key in INTERVIEWER_PERSONAS else "alex"
        self.persona = INTERVIEWER_PERSONAS[self.persona_key]

    def ask_initial_question(self, question_data: Dict[str, Any], candidate_name: str = "Candidate") -> Dict[str, Any]:
        """Crafts persona-tailored opening prompt for a question"""
        p_name = self.persona["name"]
        p_title = self.persona["title"]
        topic = question_data.get("topic", "System Architecture")
        q_text = question_data.get("question", "")
        company = question_data.get("company", "Top Tech")

        thought = f"Agent [{p_name}]: Initializing round for topic '{topic}'. Grounding question in real-world scenarios from {company}."
        
        greeting = f"Hello {candidate_name}, welcome to this round! I'm {p_name}, {p_title}. Today we'll be diving into {topic}."
        speech = f"{greeting}\n\nHere is your scenario: {q_text}"

        return {
            "speaker": self.persona["name"],
            "role": "interviewer",
            "persona": self.persona_key,
            "text": speech,
            "agent_thought": thought
        }

    def generate_followup(
        self,
        candidate_answer: str,
        question_data: Dict[str, Any],
        rag_context: Dict[str, Any],
        eval_critique: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generates dynamic follow-up probing question or Socratic drill"""
        system_prompt = (
            f"You are {self.persona['name']}, {self.persona['title']}. Style: {self.persona['style']}.\n"
            f"You are conducting a high-stakes technical interview. Keep your response professional, concise (2-4 sentences), "
            f"and directly challenge or probe the candidate's answer based on the evaluation.\n"
            f"Target Topic: {question_data.get('topic')}\n"
            f"Expected Criteria: {', '.join(question_data.get('expected_rubric', []))}\n"
            f"Evaluator Notes: {eval_critique.get('interviewer_critique', '')}\n"
        )

        user_prompt = (
            f"Candidate just said: '{candidate_answer}'\n\n"
            f"Candidate Resume Context retrieved: {rag_context.get('resume_context', [])}\n"
            f"Formulate your follow-up reaction and next probing question."
        )

        thought = f"Agent [{self.persona['name']}]: Analyzing candidate's claim on {question_data.get('topic')}. Probing deeper into architectural resilience."
        response_text = llm_engine.generate(system_prompt, user_prompt)

        return {
            "speaker": self.persona["name"],
            "role": "interviewer",
            "persona": self.persona_key,
            "text": response_text,
            "agent_thought": thought
        }


interviewer_agent = InterviewerAgent("alex")
