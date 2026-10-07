import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_auth_and_project_lifecycle():
    # 1. Sign Up
    signup_data = {
        "full_name": "Dr. Alan Turing",
        "email": "turing@researchgap.ai",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    signup_res = client.post("/api/auth/signup", json=signup_data)
    assert signup_res.status_code in [201, 400]
    
    # 2. Login
    login_data = {
        "email": "turing@researchgap.ai",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/auth/login", json=login_data)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get /me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "turing@researchgap.ai"

    # 4. Create Project
    proj_data = {
        "name": "Neural Machine Reasoning",
        "domain": "Artificial Intelligence",
        "topic": "Graph Neural Networks & Symbolic Verification",
        "description": "Evaluating out-of-distribution reasoning bounds.",
        "research_question": "Can neuro-symbolic priors bound neural reasoning errors?"
    }
    proj_res = client.post("/api/projects", json=proj_data, headers=headers)
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 5. Load Demo Project
    demo_res = client.post("/api/projects/load-demo", headers=headers)
    assert demo_res.status_code == 201
    demo_id = demo_res.json()["id"]

    # 6. Check Demo Project Papers & Gaps
    papers_res = client.get(f"/api/projects/{demo_id}/papers", headers=headers)
    assert papers_res.status_code == 200
    assert len(papers_res.json()) >= 5

    gaps_res = client.get(f"/api/projects/{demo_id}/gaps", headers=headers)
    assert gaps_res.status_code == 200
    assert len(gaps_res.json()) > 0
    top_gap_id = gaps_res.json()[0]["id"]

    # 7. Select Gap
    select_res = client.post(f"/api/projects/{demo_id}/gaps/{top_gap_id}/select", headers=headers)
    assert select_res.status_code == 200
    assert select_res.json()["is_selected"] is True

    # 8. Check Solution
    sol_res = client.get(f"/api/projects/{demo_id}/solution", headers=headers)
    assert sol_res.status_code == 200
    assert "algorithms" in sol_res.json()
    assert len(sol_res.json()["implementation_phases"]) >= 4

    # 9. Check Master Prompt
    prompt_res = client.get(f"/api/projects/{demo_id}/prompt", headers=headers)
    assert prompt_res.status_code == 200
    assert len(prompt_res.json()["prompt_text"]) > 200

    # 10. Check Report
    report_res = client.get(f"/api/projects/{demo_id}/reports/markdown", headers=headers)
    assert report_res.status_code == 200
    assert "# Academic Research Gap & Solution Report" in report_res.json()["markdown_content"]
