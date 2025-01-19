const op = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y,
    "%": (x, y) => x % y,
    "?": (x, y) => x == y ? 0 : +(x > y) - +(x < y) || NaN,
}

const relize = x => (Array.isArray(x) ? new RegExp(x[0], x[1]) : x)

var default_var_dict = {
    num: x => Number(x),
    str: x => (
        Array.isArray(x) && x.every(i => typeof i == "string" && i.length == 1)
        ? x.join("") : formatting(x)
    ),
    repr: x => repr_formatting(x),
    arr: x => [...x],
    pow: (x, y) => x ** y,
    sin: x => Math.sin(x),
    cos: x => Math.cos(x),
    tan: x => Math.tan(x),
    asin: x => Math.asin(x),
    acos: x => Math.acos(x),
    atan: x => Math.atan(x),
    band: (x, y) => x & y,
    bor: (x, y) => x | y,
    bxor: (x, y) => x ^ y,
    bnot: x => ~x,
    rand: () => Math.random(),
    randint: (x, y) => Math.floor(Math.random() * (x - y) + y),
    flr: x => Math.floor(x),
    range: x => [...Array(x).keys()],
    len: s => [...s.at(-1).at(-1)].length,
    split: (x, y) => (typeof x == "string" ? x : formatting(x)).split(y),
    join: (x, s) => ([...s.at(-1).at(-1)]
        .map(i => (typeof i == "string" ? i : formatting(i)))
        .join(x)
    ),
    reverse: s => [...s.at(-1).at(-1)].reverse(),
    in: (x, s) => [...s.at(-1).at(-1)].indexOf(x),
    filter: (x, s, v, o) => ([...s.at(-1).at(-1)].reduce((memo, i) => (
        [...(memo), [i, exec_what([...s.slice(0, -1), s.at(-1).concat([i, x])], v, o)]]
    ), [])).filter(i => i[1] || Number.isNaN(i[1])).map(i => i[0]),
    chr: x => Array.isArray(x) ? String.fromCodePoint(...x) : String.fromCodePoint(x),
    ord: x => [...(typeof x == "string" ? x : formatting(x))].map(i => i.codePointAt(0)),
    and: (x, y) => (Number.isNaN(x) ? y : x && y),
    or: (x, y) => (Number.isNaN(x) ? x : x || y),
    nan: () => NaN,
    undef: s => void s.at(-1).push(undefined),
    inf: () => Infinity,
    ninf: () => -Infinity,
    eq: (x, y) => +(x === y),
    stak: s => s.at(-1),
    stack: s => [...s.at(-1)],
    try: (s, v, o) => {
        let temp = [undefined, undefined]
        try {
            exec_what(s, v, o)
        } catch (e) {
            temp = [e.name, e.message]
        }
        return temp
    },
    throw: x => {throw new Error(x)},
    match: (x, y) => [...(x.match(relize(y)) || [])],
    repl: (x, y, z) => x.replace(relize(y), z),
    time: () => Date.now(),
    type: x => (x == undefined ? "Undefined" : x.constructor.name)
}
var need_svo = "filter try".split(" ")
var need_fstack = "len join reverse in stak stack undef".split(" ")

const formatting = x => {
    if (Array.isArray(x)) {
        return "[" + x.map(
            i => Array.isArray(i) && i == x ? "[...]" : formatting(i)
        ).join(", ") + "]"
    } else if (typeof x == "string") {
        return '"' + (x
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
        ) + '"'
    } else if (x == undefined) {
        return "undef"
    } else if (Number.isNaN(x)) {
        return "NaN"
    } else if (x == Infinity) {
        return "Inf"
    } else if (x == -Infinity) {
        return "-Inf"
    }
    return String(x)
}

const is_valid_paren_string = x => {
    let depth = 0
    for (const c of x) {
        if (c === "(") depth++
        else if (c === ")") depth--
        if (depth < 0) return false
    }
    return depth === 0
}

const repr_formatting = x => {
    if (Array.isArray(x)) {
        return (
            "[" +
            x
                .map(i => (Array.isArray(i) && i == x ? "stack@" : repr_formatting(i)))
                .join(" ") +
            "]"
        )
    } else if (typeof x == "string") {
        if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(x)) return x
        else if (is_valid_paren_string(x)) return "(" + x + ")"
        else return '"' + (x
            .replace('"', '\\"')
            .replace("\n", "\\n")
            .replace("\t", "\\t")
        ) + '"'
    } else if (x === undefined) {
        return "undef@"
    } else if (Number.isNaN(x)) {
        return "nan@"
    } else if (x == Infinity) {
        return "inf@"
    } else if (x == -Infinity) {
        return "ninf@"
    } else if (typeof x == "number") {
        if (
            x < 0 || x >= 1.0e21 ||
            !Number.isInteger(x)
        ) return "(" + String(x) + ")num@"
        return String(x)
    }
    return "${" + String(x) + "}"
}

const exec_what = (
    fstack,
    var_dict,
    output,
    { dead_loop_check = () => {} } = {}
) => {
    var stack = fstack.at(-1)
    let temp, temp2, temp3
    //I should stop temping
    temp = stack.pop()
    if (temp in var_dict && typeof var_dict[temp] === "function") {
        temp3 = need_svo.includes(temp) ? 3 : need_fstack.includes(temp) ? 1 : 0
        temp = var_dict[temp]
        temp2 = [fstack, var_dict, output]
        temp2.splice(temp3)
        temp2 = (temp.length > temp3
            ? stack.splice(temp3 - temp.length)
            : []
        ).concat(temp2)
        temp = temp(...temp2)
        if (temp != undefined) stack.push(temp)
    } else {
        temp2 = temp in var_dict ? var_dict[temp] : temp
        eval_what(temp2, fstack, var_dict, output, { dead_loop_check })
    }
    return stack.at(-1)
}
const run_what = (
    code,
    var_dict = default_var_dict,
    { dead_loop_check = () => {} } = {}
) => {
    let output = ""
    let stack = eval_what(
        code,
        [[]],
        Object.assign({}, var_dict),
        x => {
            output += x
        },
        { dead_loop_check }
    )
    return {
        stack: stack,
        output: output
    }
}

const eval_what = (
    code,
    fstack,
    var_dict,
    output = x => console.log(x),
    { dead_loop_check = () => {} } = {}
) => {
    var stack = fstack.at(-1)
    let i = -1,
        c
    let temp, temp2
    while (++i < code.length) {
        dead_loop_check()
        c = code[i]
        if (/\s/.test(c)) {
            continue
        } else if (/[1-9]/.test(c)) {
            temp = 0
            do {
                temp = temp * 10 + Number(c)
                c = code[++i]
            } while (c && /\d/.test(c))
            c = code[--i]
            stack.push(temp)
        } else if ("0" === c) {
            stack.push(0)
        } else if (/[a-zA-Z]/.test(c)) {
            temp = ""
            do {
                temp += c
                c = code[++i]
            } while (c && /[a-zA-Z0-9_]/.test(c))
            c = code[--i]
            stack.push(temp.toLowerCase())
        } else if ("'" === c) {
            stack.push((c = code[++i]))
        } else if (/["`]/.test(c)) {
            temp = ""
            temp2 = c
            c = code[++i]
            while (c) {
                if ("\\" === c) {
                    c = code[++i]
                    temp +=
                        {
                            n: "\n",
                            t: "\t",
                            [temp2]: temp2
                        }[c] ?? c
                } else if (temp2 === c) break
                else temp += c
                c = code[++i]
            }
            if ('"' === temp2) {
                stack.push(temp)
            } else if ("`" === temp2) {
                output(temp)
            }
        } else if (c in op) {
            temp = stack.pop()
            stack.push(op[c](stack.pop(), temp))
        } else if ("~" === c) {
            temp = stack.pop()
            stack.push(Number.isNaN(temp) ? 0 : +!temp)
        } else if ("[" === c) {
            stack = []
            fstack.push(stack)
        } else if ("|" === c) {
            temp = stack.pop()
            fstack.push(temp)
            stack = temp
        } else if ("]" === c) {
            if (fstack.length <= 2) fstack.unshift([])
            stack = fstack.at(-2)
            stack.push(fstack.pop())
        } else if ("(" === c) {
            temp = ""
            temp2 = 1
            c = code[++i]
            while (true) {
                if ("(" === c) ++temp2
                else if (")" === c) --temp2
                if (!c || !temp2) break
                temp += c
                c = code[++i]
            }
            stack.push(temp)
        } else if ("." === c) {
            temp = stack.at(-1)
            output(typeof temp == "string" ? temp : formatting(temp))
        } else if ("\\" === c) {
            if (stack.length >= 2) {
                temp = stack.pop()
                temp2 = stack.pop()
                stack.push(temp, temp2)
            }
        } else if ("&" === c) {
            if (stack.length >= 2) stack.unshift(stack.pop())
        } else if (":" === c) {
            if (stack.length >= 1) {
                temp = stack.pop()
                stack.push(temp, temp)
            }
        } else if ("_" === c) {
            stack.pop()
        } else if ("=" === c) {
            temp = stack.pop()
            var_dict[temp] = stack.at(-1)
        } else if ("^" === c) {
            temp = stack.pop()
            temp2 = var_dict[temp]
            stack.push(typeof temp2 == "function" ? temp + "@" : temp2)
        } else if ("@" === c) {
            exec_what(fstack, var_dict, output, { dead_loop_check })
            stack = fstack.at(-1)
        } else if (">" === c) {
            stack.push(stack.splice(-stack.pop()))
        } else if ("<" === c) {
            stack.push(...stack.pop())
        } else if ("{" === c) {
            temp = stack.pop()
            if (!(Number.isNaN(temp) || temp)) {
                temp = 1
                while (c && temp) {
                    c = code[++i]
                    if ("{" === c) ++temp
                    else if ("}" === c) --temp
                }
            }
        } else if ("}" === c) {
            temp = stack.pop()
            if (Number.isNaN(temp) || temp) {
                temp = -1
                while (c && temp) {
                    c = code[--i]
                    if ("{" === c) ++temp
                    else if ("}" === c) --temp
                }
            }
        } else if ("!" === c) {
            temp = 1
            while ("!" === code[++i]) temp++
            c = code[--i]
            while (c && temp) {
                c = code[++i]
                if ("{" === c) ++temp
                else if ("}" === c) --temp
            }
        } else if ("#" === c) {
            temp = stack.pop()
            stack.push(
                stack
                    .at(-1)
                    .reduce(
                        (memo, x) => [
                            ...(memo),
                            exec_what([stack.concat([x, temp])], var_dict, output, {
                                dead_loop_check
                            })
                        ],
                        []
                    )
            )
        } else if ("," === c) {
            temp = stack.pop()
            stack.push(stack.at(-1).slice(temp)[0])
        } else if (";" === c) {
            temp = stack.pop()
            temp2 = stack.pop()
            if (
                [undefined, +stack.at(-1).length].includes(temp2) ||
                Number.isNaN(temp2)
            ) {
                stack.at(-1).push(temp)
            } else {
                temp2 = +temp2 || 0
                if (temp2 < 0) temp2 += stack.at(-1).length
                if (temp2 >= 0) stack.at(-1).fill(temp, temp2, temp2 + 1)
            }
        } else if ("$" === c) {
            temp = stack.pop()
            stack.at(-1).splice(temp, 1)
        }
        //console.log(stack)
        ;(temp = void 0), (temp2 = void 0)
    }
    return stack.at(-1)
}
