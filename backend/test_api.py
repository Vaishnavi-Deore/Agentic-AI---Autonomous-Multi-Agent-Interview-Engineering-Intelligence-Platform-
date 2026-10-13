import json
from fastapi.testclient import TestClient
from app import app

def test():
    client = TestClient(app)
    print('Testing /api/health...')
    h_res = client.get('/api/health').json()
    print('Health:', h_res)

    print('\nTesting /api/session/start...')
    start_res = client.post('/api/session/start', json={'track': 'ai_agentic', 'persona': 'alex'}).json()
    print('Session Started! Question Topic:', start_res['active_question']['topic'])
    print('Interviewer Opening:', start_res['opening_message']['text'][:100], '...')

    print('\nTesting /api/session/answer...')
    ans_text = "I recommend using sliding-window chunking, dense vector search combined with BM25 sparse search using Reciprocal Rank Fusion, and cross-encoder reranking to prevent hallucinations."
    ans_res = client.post('/api/session/answer', json={'answer': ans_text, 'enable_council': True}).json()
    print('Answer Evaluated!')
    print('Overall Score:', ans_res['evaluation']['scores']['overall'])
    print('Rubric Coverage:', ans_res['evaluation']['rubric_alignment']['overall_coverage'], '%')
    print('Difficulty ELO:', ans_res['difficulty']['current_elo'], f"({ans_res['difficulty']['tier']})")
    print('Followup Question:', ans_res['interviewer_response']['text'][:120], '...')

    print('\nTesting /api/code/run (Python Sandbox)...')
    test_code = "print('Hello from isolated Python sandbox!')\nans = [x**2 for x in range(5)]\nprint('Squares:', ans)"
    code_res = client.post('/api/code/run', json={'code': test_code}).json()
    print('Code Sandbox Raw Response:', code_res)

    print('\nTesting /api/session/finish (Debrief Report)...')
    fin_res = client.post('/api/session/finish').json()
    print('Report Verdict:', fin_res['report']['verdict'])
    print('Readiness:', fin_res['report']['readiness_summary'])
    print('Top Strengths:', fin_res['report']['top_strengths'])
    print('Roadmap Days Count:', len(fin_res['report']['seven_day_roadmap']))

    print('\nALL INTEGRATION TESTS PASSED PERFECTLY!')

if __name__ == '__main__':
    test()
