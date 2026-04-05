import networkx as nx

def build_graph(parsed_data):
    G = nx.DiGraph()

    for file in parsed_data["files"]:
        path = file["path"]
        G.add_node(path)

        for imp in file["imports"]:
            G.add_edge(path, imp)

    return G