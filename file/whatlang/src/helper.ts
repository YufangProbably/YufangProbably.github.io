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

const help_record : Record<string, string> = ({
    "@ #": (S
        `暂且可以理解为 eval 和 map 罢。`
        `    @ 弹出，若该字符串为内置函数名则执行，_`
        `否则若该字符串为变量名则将该变量值以 WhatLang 运行，_`
        `否则将该值以 WhatLang 运行。（语言显然是 WhatLang）`
        `    # 弹出，对于栈顶中的每个元素，_`
        `复制当前栈，压入该元素，并对该值运行 @ 指令，_`
        `返回复制栈的栈顶构成的数组`
    ()),
    "+ - * / %": (S
        `运算。还有什么好说的吗？_`
        `（除非你从什么离奇语言过来的，这种情况下 * / % 分别是 乘 除 取余）`
    ()),
    ", ; $": (S
        `数组操作之类的。`
        `放大心，你是没法 ()at,constructor,f=_(return eval)()f@ 的，我们早试过了。`
        `    , 弹出一值，返回 栈顶[该值]`
        `    ; 弹出二值，并 栈顶[底值] = 顶值；_`
        `特别地，当底值为 NaN 或 undefined 时，默认为数组长度。`
        `    $ 弹出一值，并 栈顶.splice(底值, 1)。`
    ()),
    ".": (S
        `输出栈顶。`
        `和 send@ 配合会有奇效。`
    ()),
    ": \\ _": (S
        `栈操作之类的，偶尔会有点用。`
        `    : 复制栈顶值`
        `    \\ 交换栈顶二值`
        `    _ 弹出，并炸至金黄酥脆（嗯？）`
    ()),
    "< >": (S
        `解构，展开剩余……管你怎么叫，反正功能差不多。`
        `    < 将栈顶数组值依次压入栈`
        `    > 弹出，将栈顶(该值)个值压入数组并返回`
    ()),
    "= ^": (S
        `变量操作之类的。不想要 v ^ 也不想要 = $ 然后选了这两坨。`
        `    = 弹出二值，将底值赋值给名为[顶值]的变量`
        `    ^ 弹出，返回名为[顶值]的变量`
    ()),
    "?": (S
        `如果你有看到过 <=> 的话，这就是了，如果没有的话——`
        `弹出二值，若底值大于顶值则返回 1，小于则 -1， 等于则 0，单纯不等于则 NaN。`
        `补充一下，我们的NaN是个真值，也许还挺好用的（？）`
    ()),
    "~": (S
        `弹出，真则 1， 否则 0。嗯。`
    ()),
    num: (S
        `弹出，返回 Number(该值)。`
        `没有小数字面量，所以如果你需要小数什么的也许会有用？`
    ()),
    "str repr": (S
        `如果你学过 python 的话……`
        `    str 弹出，返回该值的字符串表示（除非是个 char 数组）`
        `    repr 弹出，返回一个执行后大致上是这个值的字符串`
    ()),
    arr: (S
        `弹出，返回 [...该值]。`
    ()),
    pow: (S
        `弹出二值，返回 底值 ** 顶值。`
    ()),
    "band bor bxor bnot": (S
        `弹出二值，进行位运算，返回结果。`
        `还需要我再具体点吗？`
    ()),
    "rand randint": (S
        `随机数之类的东西。`
        `    rand 返回 [0, 1) 之间的随机数`
        `    randint 弹出二值，返回 [小值, 大值) 之间的随机数`
    ()),
    flr: (S
        `弹出，返回 Math.floor(该值)`
        `什么天花板很圆啊，我们只有 1+flr@ 和 (0.5)num@+flr@，你在说什么啊？`
    ()),
    range: (S
        `弹出，返回 [0, 1, 2, 3... 该值 - 2, 该值 - 1]。`
        `你说的对，但是 ruby (0...x) 是一款——`
    ()),
    split: (S
        `弹出二值，返回 (底值的字符串表示).split(顶值)。`
        `对于 Array.prototype.split，请使用 range@(...)#。`
    ()),
    "len join reverse index": (S
        `更多的数组操作。我们为什么需要这些？`
        `    len 返回栈顶数组长度`
        `    join 弹出，返回 栈顶.join(该值)`
        `    reverse 返回 栈顶.toReversed()`
        `    index 弹出，返回 栈顶.indexOf(该值)`
    ()),
    "filter": (S
        `弹出二值，对于栈顶中的每个元素，_`
        `复制当前栈，压入该元素，并对该值运行 @ 指令，_`
        `若为真值则压入新数组并返回。`
    ()),
    "chr ord": (S
        `Unicode 之类的。大概吧。嗯。`
        `    chr 弹出，返回 该数组每个值 或 该数 在 Unicode 中的对应字符。`
        `    ord 弹出，返回该值每个字符的 Unicode 码位。`
    ()),
    "and or": (S
        `短路与和短路或。`
        `别人不短路不干活，我们不短路照样干活，我们勤奋，我们好（嗯？）`
    ()),
    "nan undef inf ninf": (S
        `分别返回 NaN，undefined，Infinity，-Infinity。`
        `我们的 NaN 是个真值，或许在哪里有用吧？`
    ()),
    eq: (S
        `弹出二值，返回 底值 === 顶值。什么是 NaN？`
    ()),
    "stack stak": (S
        `奇妙的栈它自己。`
        `    stack 返回栈的浅拷贝`
        `    stak 返回栈`
    ()),
    "try throw": (S
        `异常捕获之类的。`
        `日后不太可能会支持其它异常类型。`
        `    try 弹出，运行 @ 指令，_`
        `若有异常则立即返回 [异常.name 异常.message]，否则返回 [undefined, undefined]`
        `    throw 弹出，并抛出 new Error(该值)`
    ()),
    "match repl reesc": (S
        `正则表达式之类的。应该吧？`
        `用数组表示正则表达式时为 new RegExp(该值[0], 该值[1])。`
        `repl@ 暂不支持函数。（毕竟我们的函数全都是字符串）`
        `    match 弹出二值，返回 底值.match(顶值)`
        `    repl 弹出三值，返回 底值.replace(中值, 顶值)`
        `    reesc 弹出，对其进行正则转义并返回。`
    ()),
    "help helpall" : (S
        `……？`
    ()),
    "pr prompt": (S
        `仅对后文管用的消息获取。`
        `    pr 大致上是 (me@1, prompt@ 0,)@ 的缩写。`
        `    prompt 弹出，若为数组则试图获取发送者ID在该数组中的消息，_`
        `否则试图获取发送者ID为该数的消息，_`
        `返回由消息内容，消息ID，消息发送者，消息发送者ID构成的数组。`
    ()),
    me : (S
        `返回由该消息内容，消息ID，消息发送者，消息发送者ID构成的数组。`
        `呃不，不是我，是你。`
    ()),
    cat: (S
        `弹出，当作 URL 获取文本并返回。`
        `如果你实在闲着，试试配合 match@ 写个爬虫？`
    ()),
    "outimg outaudio outvideo outfile outquote outhtml outksq": (S
        `适用于你需要一点什么图的情景。`
        `配合 send@ 也许会更好用？`
        `    outimg 弹出，输出 h.image(该值)`
        `    outaudio 弹出，输出 h.audio(该值)`
        `    outvideo outfile outquote... `
        `    outhtml 弹出，以 Consolas 字体显示为图片`
        `    outksq 弹出，以 Kreative Square 字体显示为图片`
    ()),
    "send sends": (S
        `如果你需要发送多条消息，也许会挺好用的？`
        `    send 立即发送前一次输出的内容`
        `    sends 弹出，立即发送前(该值)次输出的内容`
    ()),
    msgre: (S
        `仅对前文管用的消息获取。`
        `弹出，获取一条满足 (该值.test(内容) || 该值 === 内容) 的消息，_`
        `并返回由消息内容，消息ID，消息发送者，消息发送者ID构成的数组。`
    ()),
    sleep: (S
        `弹出，睡死(该值)秒。`
        `你以为呢？`
    ()),
})
const help_list : string[] = (Object.keys(help_record)
    .join(" ").split(" ")
    .filter((x : string) => /[a-zA-Z][a-zA-Z0-9_]*/.test(x))
).sort()

const help : Function = (x : string | undefined) => {
    if (x === undefined) {
        return (S
            `WhatLang 为一门大致上基于栈，完全没有任何优势的语言。`
            `这破玩意目前只有一个 TypeScript 写的，在 Koishi 上运行的解释器（也就是你用的这个），_`
            `所以很多指令都是只能在聊天平台上运行的。（也许我本来就是为了这个？）`
            ``
            `输入 '¿helpall@' 返回全部内置函数列表`
            `输入 '¿(内置函数名 或 某个 ASCII 字符) help@' 返回对应指令帮助`
            `输入 '¿example help@.' 返回一些示例`
        ())
    } else if (x === "all") {
        return help_list.join("\t")
    } else if (x === "example") {
        return (S
            `输出 "Hello world! ": `
            `    ¿\`Hello, world! \``
            `输出 1 + 2: `
            `    ¿1 2 + .`
            `将 1 赋值给 var 并立马输出三次: `
            `    ¿1 var= ...`
            `for (let i = 0; i++; i != 5) {output("Hi", i)}: `
            `    ¿0 i=_ :{\`Hi\` i^ 1 + i= . 5 ?~}`
            `    或 ¿5 range@ (\`Hi\`.)#_ `
            `获取随机猫猫图片：`
            `    ¿(https://api.thecatapi.com/v1/images/search) cat@ ("url":"(.+?)") match@1, outimg@`
        ())
    } else if (/^[\(\)"'`a-zA-Z]$/.test(x)) {
        return (S
            `/[a-zA-Z][a-zA-Z0-9_]*/ \`...\` "..." (...) '`
            ``
            `字符串什么的。`
            `    \`...\` 当场输出内容，不存储`
            `    (...) 不作任何转义，但要求内部圆括号匹配`
            `    ' 单长度字符，不作任何转义（只需要 'a，不用 'a'）`
        ())
    } else if (/[\[|\]]/.test(x)) {
        return (S
            `[...] |...]`
            ``
            `与数组字面量的关系就跟 Brainf??k 中的 [...] 和 while (x) {...} 的关系一样。`
            `    [ 新建栈，并进入该栈`
            `    ] 退出当前栈，并作为数组返回`
            `    | 弹出，并进入该数组`
        ())
    } else if (/[{!}]/.test(x)) {
        return (S
            `{...} /!+/`
            ``
            `大致是 Brainf??k 中的 [...]（但是我们有break所以我们牛逼）`
            `用于判断的值需要复用请使用 :{...:}。`
            `    { 弹出，若为假则跳转至匹配的 }`
            `    } 弹出，若为真则跳转至匹配的 {`
            `    ! 跳转至第(!的数量)层循环外`
        ())
    } else if (/\d/.test(x)) {
        return (S
            `/\d+/`
            ``
            `数字字面量。不然呢？`
            `若想使用小数，请 5 2 / 或者 (2.5)num@，感谢您的配合。`
        ())
    } else if (x === " ") {
        return "不，我们的空格真的是 NOP。没有功能。真的。"
    } else if (/[\x00-\x1F]/.test(x)) {
        return "……我知道这是 ASCII，但你真的不觉得哪里有问题吗？"
    } else {
        let name : string | undefined = Object.keys(help_record).find((i : any) => i.split(" ").includes(x))
        if (!name) return "指令未芝士——大概是谁自个儿写的变量？"
        return name.replace(/(?<=\b[a-zA-Z][a-zA-Z0-9_]*\b)/g, "@") + "\n" + help_record[name]
    }
}

export {help, help_list}