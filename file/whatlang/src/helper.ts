type Raw = {
    raw: readonly string[] | ArrayLike<string>;
}
const S = (x : Raw, ...eltwa : any[]) => {
  var str : string = ""
  const tag : Function = (x : Raw, ...eltwa : any[]) => {
    if (!x) return str.slice(0, str.length - 1)
    str += String.raw(x, ...eltwa)
        .replace(/\\`/g, "`")
        .replace(/\\\\/g, "\\")
    if (str.slice(-1) != "_") str += "\n"
    else str = str.slice(0, -1)
    return tag
  }
  return tag(x, ...eltwa)
}

var help_dict : Record<string, string> = ({
    "@ #": (S
        `暂且可以理解为eval和map罢。`
        ``
        `    @ 弹出，若该字符串为内置函数名则执行，_`
        `否则若该字符串为变量名则 eval 该变量值，_`
        `否则 eval 该字符串（语言显然是 WhatLang）`
        `    # 弹出二值，对于底值中的每个元素，_`
        `复制当前栈，压入该元素，并试图 @ 顶值，_`
        `返回复制栈的栈顶构成的数组`
    ()),
    "+ - * / %": (S
        `运算。还有什么好说的吗？_`
        `（除非你从什么离奇语言过来的，_`
        `这种情况下 * / % 分别是 乘 除 取余）`
    ()),
    ", ;": (S
        `数组操作之类的。`
        `放大心，你是没法 []flat,constructor,f=_(return eval)()f@ 的，我们早试过了。`
        ``
        `    , 弹出一值，返回 栈顶[该值]`
        `    ; 弹出二值，并 栈顶[底值] = 顶值；_`
        `特别地，当底值为 NaN或 undefined 时，默认为数组长度；_`
        `当顶值为 NaN 或 undefined 时，为 栈顶.splice(底值, 1)`
    ()),
    ".": (S
        `输出栈顶。`
        `呃，要不我凑点字数？`
    ()),
    ": \\ _": (S
        `栈操作之类的，偶尔会有点用。`
        ``
        `    : 复制栈顶值`
        `    \\ 交换栈顶二值`
        `    _ 弹出，并炸至金黄酥脆（嗯？）`
    ()),
    "< >": (S
        `解构，展开剩余……管你怎么叫，反正功能差不多。`
        ``
        `    < 将栈顶数组值依次压入栈`
        `    > 弹出，将栈顶[该值]个值压入一个数组`
    ()),
    "= ^": (S
        `变量操作之类的。不想要 v ^ 也不想要 = $ 然后选了这两坨。`
        ``
        `    = 弹出二值，将底值赋值给名为[顶值]的变量`
        `    ^ 弹出，返回名为[顶值]的变量`
    ()),
    "?": (S
        `如果你有看到过 <=> 的话，这就是了，如果没有的话——`
        `弹出二值，若底值大于顶值则返回 1，小于则 -1， 等于则 0，单纯不等于则 NaN。`
        `补充一下，我们的NaN是个真值，所以还挺好用的（？）`
    ()),
    "~": (S
        `弹出，真则 1， 否则 0。嗯。`
    ()),
    num: "还没写好啊嗯",
    str: "还没写好啊嗯",
    repr: "还没写好啊嗯",
    arr: "还没写好啊嗯",
    pow: "还没写好啊嗯",
    "band bor bxor": "还没写好啊嗯",
    rand: "还没写好啊嗯",
    randint: "还没写好啊嗯",
    flr: "还没写好啊嗯",
    range: "还没写好啊嗯",
    split: "还没写好啊嗯",
    "len join reverse index": "还没写好啊嗯",
    "chr ord": "还没写好啊嗯",
    "and or": "还没写好啊嗯",
    "nan undef inf ninf": "还没写好啊嗯",
    eq: "还没写好啊嗯",
    "stack stak": "还没写好啊嗯",
    "match repl reesc": "还没写好啊嗯",
    "prompt uprompt": "还没写好啊嗯",
    cat: "还没写好啊嗯",
    "outimg outaudio outvideo outfile outquote": "还没写好啊嗯",
    "sendimg sendaudio sendvideo sendfile": "还没写好啊嗯",
    msgre: "还没写好啊嗯",
    sendhtml: "还没写好啊嗯",
    send: "还没写好啊嗯",
    sleep: "还没写好啊嗯",
})

const help : Function = (x : string) => {
    if (/^[\(\)"'`a-zA-Z]$/.test(x)) {
        return (S
            `/[a-zA-Z][a-zA-Z0-9_]*/ \`...\` "..." '...' (...)`
            ``
            `字符串和注释什么的。`
            `    \`...\` 当场输出内容，不存储`
            `    '...' 不作任何转义，在内容长度超过1时无视（'''.png）`
            `    (...) 不作任何转义，但要求内部圆括号匹配`
        ())
    } else if ("[|]".includes(x)) {
        return (S
            `[...] |...]`
            ``
            `与数组字面量的关系就跟 Brainf??k 中的 [...] 和 while (x) {...} 的关系一样。`
            `    [ 新建栈，并进入该栈`
            `    ] 退出当前栈，并作为数组返回`
            `    | 弹出，并进入该数组`
        ())
    } else if ("{!}".includes(x)) {
        return (S
            `{...} /!+/`
            ``
            `大致是 Brainf??k 中的 [...]（但是我们有break所以我们牛逼）`
            `用于判断的值需要复用请使用 :{...:}。`
            `    { 弹出，若为假则跳转至匹配的 }`
            `    } 弹出，若为真则跳转至匹配的 {`
            `    ! 跳转至第[!的数量]层循环外`
        ())
    } else if ("0123456789".includes(x)) {
        return (S
            `/\d+/`
            ``
            `数字字面量。不然呢？`
            `若想使用小数，请 5 2 / 或者 (2.5)num@，感谢您的配合。`
        ())
    } else if (x === " ") {
        return "不，我们的空格真的是NOP。没有功能。真的。"
    } else {
        let name : string | undefined = Object.keys(help_dict).find((i : any) => i.split(" ").includes(x))
        if (!name) return "指令未芝士——也许是谁自个儿写的变量？"
        return name + ": \n" + help_dict[name]
    }
}