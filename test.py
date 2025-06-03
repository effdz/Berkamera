import matplotlib.pyplot as plt
import networkx as nx

# Buat graf
G = nx.DiGraph()

# Label node
labels = {
    1: "START",
    2: "VALIDASI TITLE",
    3: "VALIDASI CONTENT",
    4: "VALIDASI IMAGE",
    5: "VALIDASI CATEGORY",
    6: "GENERATE IMAGE NAME",
    7: "SIMPAN IMAGE",
    8: "SIMPAN ARTIKEL",
    9: "REDIRECT TO INDEX",
    10: "END (SUKSES)",
    11: "END (ERROR)"
}

# Tambahkan node
for n, label in labels.items():
    G.add_node(n, label=label)

# Tambahkan edge logika
edges = [
    (1, 2),            # START → TITLE
    (2, 3), (2, 11),   # TITLE valid / invalid
    (3, 4), (3, 11),   # CONTENT valid / invalid
    (4, 5), (4, 11),   # IMAGE valid / invalid
    (5, 6), (5, 11),   # CATEGORY valid / invalid
    (6, 7),
    (7, 8),
    (8, 9),
    (9, 10)
]
G.add_edges_from(edges)

# Posisi node (vertikal + error ke kanan)
pos = {
    1: (0, 8),
    2: (0, 7),
    3: (0, 6),
    4: (0, 5),
    5: (0, 4),
    6: (0, 3.2),
    7: (0, 2.4),
    8: (0, 1.6),
    9: (0, 0.8),
    10: (0, 0),
    11: (2, 5.5)
}

# Gambar graf
plt.figure(figsize=(8, 10))
nx.draw(G, pos, with_labels=True, labels=labels, node_size=3000,
        node_color="lightblue", font_size=9, font_weight="bold", arrows=True, arrowstyle='-|>')

# Tambahkan label kondisi (yes/no)
edge_labels = {
    (2, 3): "YES", (2, 11): "NO",
    (3, 4): "YES", (3, 11): "NO",
    (4, 5): "YES", (4, 11): "NO",
    (5, 6): "YES", (5, 11): "NO"
}
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_color='red', font_size=9)

plt.title("Control Flow Graph – Fitur Create Artikel", fontsize=14)
plt.axis('off')
plt.tight_layout()
plt.savefig("cfg_create_article_vertikal.png")
plt.show()
