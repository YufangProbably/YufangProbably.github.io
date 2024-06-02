"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_var_dict = exports.run_what = exports.eval_what = exports.exec_what = exports.formatting = void 0;
const op = {
    "+": (x, y) => (x + y),
    "-": (x, y) => (x - y),
    "*": (x, y) => (x * y),
    "/": (x, y) => (x / y),
    "%": (x, y) => (x % y),
    "?": (x, y) => x == y ? 0 : +(x > y) - +(x < y) || NaN,
};
var default_var_dict = ({
    num: (x) => Number(x),
    str: (x) => (Array.isArray(x) && x.every(i => typeof i == "string" && i.length == 1)
        ? x.join("") : formatting(x)),
    repr: (x) => repr_formatting(x),
    arr: (x) => [...x],
    pow: (x, y) => x ** y,
    band: (x, y) => x & y,
    bor: (x, y) => x | y,
    bxor: (x, y) => x ^ y,
    rand: () => Math.random(),
    randint: (x, y) => Math.floor((Math.random() * (x - y)) + y),
    flr: (x) => Math.floor(x),
    range: (x) => [...Array(x).keys()],
    len: (x) => x.length,
    split: (x, y) => (typeof x == "string" ? x : formatting(x)).split(y),
    join: (x, y) => [...x].map(i => typeof i == "string" ? i : formatting(i)).join(y),
    reverse: (x) => [...x].reverse(),
    index: (x, y) => [...x].indexOf(y),
    chr: (x) => String.fromCodePoint(x),
    ord: (x) => [...typeof x == "string" ? x : formatting(x)].map(i => i.codePointAt(0)),
    and: (x, y) => x && y,
    or: (x, y) => x || y,
    nan: () => NaN,
    undef: () => undefined,
    inf: () => Infinity,
    ninf: () => -Infinity,
    eq: (x, y) => x === y,
    stack: (s = []) => s[s.length - 1],
    stak: (s = []) => [...s[s.length - 1]],
    match: (x, y) => [...x.match(Array.isArray(y) ? new RegExp(y[0], y[1]) : y) || []],
    repl: (x, y, z) => x.replace(Array.isArray(y) ? new RegExp(y[0], y[1]) : y, z),
});
exports.default_var_dict = default_var_dict;
const formatting = (x) => {
    if (Array.isArray(x)) {
        return "[" + x.map(i => Array.isArray(i) && i == x ? "[...]" : formatting(i)).join(", ") + "]";
    }
    else if (typeof x == "string") {
        return '"' + (x
            .replace('"', '\\"')
            .replace('\n', '\\n')
            .replace('\t', '\\t')) + '"';
    }
    else if (x === undefined) {
        return "undef";
    }
    else if (Number.isNaN(x)) {
        return "NaN";
    }
    else if (x == Infinity) {
        return "Inf";
    }
    else if (x == -Infinity) {
        return "-Inf";
    }
    return String(x);
};
exports.formatting = formatting;
const repr_formatting = (x) => {
    if (Array.isArray(x)) {
        return "[" + x.map(i => Array.isArray(i) && i == x ? "stack@" : repr_formatting(i)).join(" ") + "]";
    }
    else if (typeof x == "string") {
        if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(x))
            return x;
        else if (!x.includes("(") ||
            [...x].filter(i => i === "(").length == [...x].filter(i => i === ")").length &&
                x.indexOf("(") < x.indexOf(")") &&
                x.lastIndexOf("(") < x.lastIndexOf(")"))
            return "(" + x + ")";
        else
            return '"' + (x
                .replace('"', '\\"')
                .replace('\n', '\\n')
                .replace('\t', '\\t')) + '"';
    }
    else if (x === undefined) {
        return "undef@";
    }
    else if (Number.isNaN(x)) {
        return "nan@";
    }
    else if (x == Infinity) {
        return "inf@";
    }
    else if (x == -Infinity) {
        return "ninf@";
    }
    else if (typeof x == "number") {
        return String(x);
    }
    return "${" + String(x) + "}";
};
const exec_what = async (fstack, var_dict, output) => {
    var stack = fstack[fstack.length - 1];
    let temp, temp2;
    temp = stack.pop();
    if (temp in var_dict && typeof var_dict[temp] === "function") {
        temp = var_dict[temp];
        temp2 = temp.length ? stack.splice(-temp.length) : [];
        temp = await Promise.resolve(temp(...temp2, fstack));
        if (temp !== undefined && temp !== null)
            stack.push(temp);
    }
    else {
        temp2 = temp in var_dict ? var_dict[temp] : temp;
        await eval_what(temp2, fstack, var_dict, output);
    }
    return stack[stack.length - 1];
};
exports.exec_what = exec_what;
const run_what = async (code, var_dict = default_var_dict) => {
    let output = "";
    let stack = await eval_what(code, [[]], Object.assign({}, var_dict), (x) => { output += x; });
    return ({
        stack: stack,
        output: output,
    });
};
exports.run_what = run_what;
const eval_what = async (code, fstack, var_dict, output = (x) => console.log(x)) => {
    var stack = fstack[fstack.length - 1];
    let i = -1, c;
    let temp, temp2;
    while (++i < code.length) {
        c = code[i];
        if (/\s/.test(c)) {
            continue;
        }
        else if (/\d/.test(c)) {
            temp = 0;
            do {
                temp = temp * 10 + Number(c);
                c = code[++i];
            } while (c && /\d/.test(c));
            c = code[--i];
            stack.push(temp);
        }
        else if (/[a-zA-Z]/.test(c)) {
            temp = "";
            do {
                temp += c;
                c = code[++i];
            } while (c && /[a-zA-Z0-9_]/.test(c));
            c = code[--i];
            stack.push(temp.toLowerCase());
        }
        else if ("'" == c) {
            stack.push(c = code[++i]);
        }
        else if (/["`]/.test(c)) {
            temp = "";
            temp2 = c;
            c = code[++i];
            while (c) {
                if ("\\" == c) {
                    c = code[++i];
                    temp += ({
                        "n": "\n",
                        "t": "\t",
                        [temp2]: temp2
                    })[c] ?? c;
                }
                else if (temp2 == c)
                    break;
                else
                    temp += c;
                c = code[++i];
            }
            if ('"' == temp2) {
                stack.push(temp);
            }
            else if ('`' == temp2) {
                output(temp);
            }
        }
        else if (c in op) {
            temp = stack.pop();
            stack.push(op[c](stack.pop(), temp));
        }
        else if ('~' == c) {
            temp = stack.pop();
            stack.push(Number.isNaN(temp) ? 0 : +!temp);
        }
        else if ('[' == c) {
            stack = [];
            fstack.push(stack);
        }
        else if ('|' == c) {
            fstack.push(stack.pop());
        }
        else if (']' == c) {
            stack = fstack[fstack.length - 2];
            stack.push(fstack.pop());
        }
        else if ('(' == c) {
            temp = "";
            temp2 = 1;
            c = code[++i];
            while (true) {
                if ('(' == c)
                    ++temp2;
                else if (')' == c)
                    --temp2;
                if (!c || !temp2)
                    break;
                temp += c;
                c = code[++i];
            }
            stack.push(temp);
        }
        else if ('.' == c) {
            temp = stack[stack.length - 1];
            output(typeof temp == "string" ? temp : formatting(temp));
        }
        else if ('\\' == c) {
            if (stack.length >= 2) {
                temp = stack.pop();
                temp2 = stack.pop();
                stack.push(temp, temp2);
            }
        }
        else if (':' == c) {
            if (stack.length >= 1) {
                temp = stack.pop();
                stack.push(temp, temp);
            }
        }
        else if ('_' == c) {
            stack.pop();
        }
        else if ('=' == c) {
            temp = stack.pop();
            var_dict[temp] = stack[stack.length - 1];
        }
        else if ('^' == c) {
            temp = stack.pop();
            temp2 = var_dict[temp];
            stack.push(typeof temp2 == "function" ? "(" + temp + "@)" : temp2);
        }
        else if ('@' == c) {
            await exec_what(fstack, var_dict, output);
            stack = fstack[fstack.length - 1];
        }
        else if ('>' == c) {
            stack.push(stack.splice(-stack.pop()));
        }
        else if ('<' == c) {
            stack.push(...stack.pop());
        }
        else if ('{' == c) {
            temp = stack.pop();
            if (!(Number.isNaN(temp) || temp)) {
                temp = 1;
                while (c && temp) {
                    c = code[++i];
                    if ('{' == c)
                        ++temp;
                    else if ('}' == c)
                        --temp;
                }
            }
        }
        else if ('}' == c) {
            temp = stack.pop();
            if (Number.isNaN(temp) || temp) {
                temp = -1;
                while (c && temp) {
                    c = code[--i];
                    if ('{' == c)
                        ++temp;
                    else if ('}' == c)
                        --temp;
                }
            }
        }
        else if ('!' == c) {
            temp = 1;
            while ('!' == code[++i])
                temp++;
            c = code[--i];
            while (c && temp) {
                c = code[++i];
                if ('{' == c)
                    ++temp;
                else if ('}' == c)
                    --temp;
            }
        }
        else if ("#" == c) {
            temp2 = stack.pop();
            temp = stack.pop();
            stack.push(await temp.reduce(async (memo, x) => ([...await memo, await exec_what([stack.concat([x, temp2])], var_dict, output)]), []));
        }
        else if ("," == c) {
            temp = stack.pop();
            stack.push(stack[stack.length - 1].slice(temp, temp + 1)[0]);
        }
        else if (";" == c) {
            temp = stack.pop();
            temp2 = stack.pop();
            if (temp2 === undefined || temp2 === null || Number.isNaN(temp2)) {
                temp2 = stack[stack.length - 1].length;
            }
            if (temp === undefined || temp === null || Number.isNaN(temp)) {
                stack[stack.length - 1].splice(temp2, 1);
            }
            else {
                stack[stack.length - 1].fill(temp, temp2, temp2 + 1);
            }
        }
        //console.log(stack)
        temp = void 0, temp2 = void 0;
    }
    return stack[stack.length - 1];
};
exports.eval_what = eval_what;
run_what('(aaaa"b) [(a+.(b)) ""]match @.').then(x => console.log(x.output));
