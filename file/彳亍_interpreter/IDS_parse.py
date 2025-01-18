(
    req := __import__("urllib.request").request,
    os := __import__("os.path"),
    pickle := __import__("pickle"),
    
    cat := __import__("catcher"),
    
    IDS_URL := (
        r"https://raw.githubusercontent.com/"
        r"yi-bai/ids/refs/heads/main/ids_lv1.txt"
    ),
    IDS_FILE := os.path.join(os.getcwd(), r"IDS_dict.pickle"),

    IDC_dict := ({}
        | dict.fromkeys("⿾⿿", 1)
        | dict.fromkeys("⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻⿽⿼㇯", 2)
        | dict.fromkeys("⿲⿳", 3)
    ),
    IDS_solve := lambda source: (
        res := [],
        i := len(source), c := None,
        temp := [],
        [(
            I := source[:i].rfind("("),
            temp.append(source[I:i + 1]),
            i := I,
        ) if (c := source[i := ~-i]) == ")" else (
            i := source[:i].rfind("["),
        ) if c == "]" else (
            res.append(c + temp.pop()),
        ) if c == "#" else (
            T := range(IDC_dict.get(c, 0)),
            res.append([c] + [res.pop() for _ in T]),
        ) if c in IDC_dict else (
            res.append(c),
        ) for _ in iter(lambda: i > 0, False)],
        res[0]
    )[-1],

    (
        data := cat.TPwith(open(IDS_FILE, "rb"), pickle.load)[0],
    ) if os.path.isfile(IDS_FILE) else (
        data := req.urlopen(IDS_URL).read().decode("utf-8"),
        data := {
            (p_row := row.split("\t"))[0]:
            sum((col.split(";") for col in p_row[1:]), [])
            for row in data.split("\n")
        },
    ),

    IDS_get := lambda char: (
        get := data.get(char, None),
        res := [],
        None if get is None else (
            res := [IDS_solve(i) for i in get],
            data.update({char: res}),
        ) if type(get[0]) == str else (
            res := get,
        ) if type(get[0]) == list else None,
        res
    )[-1],
    cache_in := lambda: cat.TPwith(
        open(IDS_FILE, "wb"),
        lambda f: pickle.dump(data, f)
    ),
)
