(
    sys := __import__("sys"),
    random := __import__("random"),

    IDS := __import__("IDS"),
    cat := __import__("catcher"),

    matches := lambda x, y: (
        None not in (x, y) and
        all(j in ("_", "＿", None, i) for i, j in zip(x, y))
    ),

    read_T := lambda stdin: (buffer := []) and False or (
        reads := lambda: buffer.extend(stdin.readline()[::-1]),
        read_char := lambda: (buffer or reads(), buffer.pop())[-1],
        read_by := lambda check: (
            res := "",
            char := read_char(),
            [(
                res := res + char,
                char := read_char(),
            ) for _ in iter(lambda: check(char, res), False)],
            buffer.append(char),
            res
        )[-1],
        read_space := lambda: read_by(lambda i, _: i in "\x20\xA0\t\n"),
        read_num := lambda: (
            read_space(),
            res := read_by(lambda i, _: i in "0123456789"),
            len(res) and int(res)
        )[-1],
    ),
    
    彳亍_opmap := [
        (OP_ILE :=  8, "⿰＿阝", ""),
        (OP_WHI :=  7, "⿰阝＿", ""),
        (OP_INC :=  0, "⿰亻＿", "人亻"),
        (OP_DEC :=  1, "⿰口＿", "口"),
        (OP_SWP :=  2, "⿰彳＿", "彳"),
        (OP_OTU :=  3, "⿰犭＿", "犬犭"),
        (OP_OTN :=  4, "⿰忄＿", "心忄"),
        (OP_ZER :=  5, "⿰氵＿", "水氵"),
        (OP_POP :=  6, "⿰火＿", "火"),
        (OP_HLT :=  9, "⿰木＿", "木"),
        (OP_CLR := 10, "⿰扌＿", "手扌"),
        (OP_RND := 11, "⿰钅＿", "金钅"),
        (OP_ITN := 12, "⿱＿灬", "灬"),
        (OP_ITU := 13, "⿱艹＿", "艹"),
        (OP_DIG := 14, "⿰冫＿", "冫"),
        (OP_SQU := 15, "⿰光＿", "光"),
        (OP_CMP := 16, "⿱𥫗＿", "竹𥫗"),
        (OP_STA := 17, "⿰土＿", "土"),
    ],
    
    彳亍_compile := lambda source: (
        source := [(c, IDS.IDS_get(c)) for c in source],
        IDS.cache_in(),
        code := [],
        [next((
            code.append(v) for v, m, s in 彳亍_opmap
            if c in s or any(matches(i, m) for i in I)
        ), None) for c, I in source],
        code,
    )[-1],

    彳亍_exec := lambda
        source,
        extend = False,
        stdout = sys.stdout,
        stdin = sys.stdin,
    : (
        code := 彳亍_compile(source),

        T := read_T(stdin),
        reads := T[0],
        read_char := T[1],
        read_space := T[3],
        read_num := T[4],
        write := lambda *a: (
            stdout.write("".join(map(str, a))),
            stdout.flush()
        ),

        brac_dict := {}, bracs := [],
        [( 
            c != OP_WHI or bracs.append(i),
            c != OP_ILE or brac_dict.update({
                i: bracs[-1],
                bracs.pop(): i
            }),
        ) for i, c in enumerate(code)],

        stacks := [[], stack := []],
        pop := lambda: len(stack) and stack.pop(),
        push := lambda *a: stack.extend(a),
        i := 0,
        breaks := False,
        [(
            top := len(stack) and stack[-1],
            c := code[i],
            c != OP_INC or push(pop() + 1),
            c != OP_DEC or push(pop() - 1),
            c != OP_SWP or (pop(), push(top, pop())),
            c != OP_OTU or write(chr(max(top, 0))),
            c != OP_OTN or write(top),
            c != OP_ZER or push(0),
            c != OP_POP or pop(),
            c != OP_WHI or top or  (i := brac_dict.get(i, i)),
            c != OP_ILE or top and (i := brac_dict.get(i, i)),
            c != OP_HLT or (breaks := True),
            c != OP_CLR or stack.clear(),
            c != OP_RND or push(random.randint(0, 1)),
            c != OP_ITU or push(ord(read_char())),
            c != OP_ITN or push(read_num()),
            c != OP_SQU or push(pop() ** 2),
            extend and (
                c != OP_DIG or stack and push(stack.pop(0)),
                c != OP_CMP or (
                    pop(), sop := pop(),
                    push((top > sop) - (sop > top))
                ),
                c != OP_STA or stacks.append(stack := stacks.pop(0)),
            ),
            i := i + 1,
        ) for _ in iter(lambda: i >= len(code) or breaks, True)],
        None
    )[-1],

    __name__ == "__main__" and (
        ap := __import__("argparse"),
        io := __import__("io"),
        
        parser := ap.ArgumentParser(
            description = "a 彳亍 interpreter",
        ),
        parser.add_argument(
            "-e", "--eval",
            action = "store_true",
            help = "take the argument as script",
        ),
        parser.add_argument(
            "-x", "--extend",
            action = "store_true",
            help = "using extend commands",
        ),
        parser.add_argument(
            "source",
            help = "the file read from; Could be the script when `--eval`",
        ),
        args := parser.parse_args(args = None if sys.argv[1:] else ["-h"]),
        
        code := args.source if args.eval else cat.TPwith(
            open(args.source, "r"),
            lambda f: f.read(),
        ),
        彳亍_exec(
            code,
            extend = args.extend,
        ),
    ),
)
