from dependency_graph import build_graph
from centrality import compute_centrality
from ranker import get_file_scores

parsed_data = {
    "files": [
        {"path": "app.py", "imports": ["auth.py", "settings.py"]},
        {"path": "auth.py", "imports": ["orders.py"]},
        {"path": "orders.py", "imports": ["billing.py"]},
        {"path": "billing.py", "imports": ["repos.py"]},
        {"path": "repos.py", "imports": ["orm.py"]},
        {"path": "orm.py", "imports": []},
        {"path": "settings.py", "imports": []},
        {"path": "wsgi.py", "imports": ["app.py"]}
    ]
}

result = get_file_scores(parsed_data)

print("\nRanked Files:")
for item in result["file_scores"]:
    print(item["file"], "->", round(item["importance"], 3))