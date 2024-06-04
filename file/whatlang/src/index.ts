import {Computed, Context, Schema, Session, h, escapeRegExp} from 'koishi'
import * as what from './whatlang_interpreter'
import {help, help_list} from './helper'

export const name = 'whatlang'
export interface Config {
    requireAppel: Computed<boolean>,
}
export const Config = Schema.object({
    requireAppel: (Schema
        .computed(Boolean).default(false)
        .description("在群聊中，使用“¿”快捷方式是否必须 @ bot 或开头带昵称。")
    ),
})

const htmlize : Function = (x : any, style : Record<string, any> = {
    padding: "5px",
    "max-width": "96ch",
    "font-family": "Consolas",
    "overflow-wrap": "break-word",
    "white-space": "break-spaces",
}) => h("html", {}, [h("div", {style: style}, [typeof x == "string" ? x : what.formatting(x)])])

const run_what = async (code : string, session : Session) => {
    let output : (h | string)[] = []
    let stack : any = await what.eval_what(
        code, [[]], 
        Object.assign({
            help: (x : any) => help(x),
            helpall: (x : any) => void output.push(htmlize(help_list.reduce(
                (last : any, n : any, i : number) => last + (i % 8 ? " ".repeat(16 - n.length) : "\n") + n, ""
            ).trim())),
            pr: async () => session.prompt(),
            prompt: async (x : any) => {
                return new Promise(res => {
                    const dispose = (session.app
                        .platform(session.platform)
                        .channel(session.channelId)
                        .middleware((session2, next) => {
                            if (x &&
                                session2.userId != x &&
                                !(Array.isArray(x) && x.includes(session2.userId))
                            ) return next()
                            if (session2.cid != session.cid) return next()
                            clearTimeout(timeout)
                            res([
                                session2.content, session2.messageId,
                                session2.event.user.name, session2.userId,
                            ])
                            dispose()
                        })
                    )
                    const timeout = setTimeout(() => {
                        dispose()
                        res(undefined)
                    }, session.app.config.delay.prompt)
                    return
                })
            },
            me: () => [
                session.content, session.messageId,
                session.event.user.name, session.userId,
            ],
            outimg: async (x : any) => void output.push(h.image(x)),
            outaudio: async (x : any) => void output.push(h.audio(x)),
            outvideo: async (x : any) => void output.push(h.video(x)),
            outfile: async (x : any) => void output.push(h.file(x)),
            outquote: async (x : any) => void output.push(h.quote(x)),
            outat: async (x : any) => void output.push(h.at(x)),
            outhtml: async (x : any) => void output.push(htmlize(x)),
            outksq: async (x : any) => void output.push(htmlize(x, {
                "line-height": "1",
                "font-family": "Kreative Square",
                "white-space": "break-spaces",
            })),
            nout: () => void output.pop(),
            nouts: (x : any) => void output.splice(-x),
            send: async () => void await session.send(output.pop()),
            sends: async (x : any) => void await session.send(output.splice(-x)),
/*
            panic: async () => {const d = session.app.before("send", () => {d(); return true})},
            panics: async (x : any) => {const d = session.app.before("send", () => {
                if (!x--) d()
                return true
            })},
*/
            cat: async (x : any) => {
                try {return await session.app.http.get(String(x), {responseType: "text"})}
                catch (err) {session.send(String(err)); return}
            },
            reesc: (x : any) => escapeRegExp(x),
            msgre: async (x : any) => {
                const r : RegExp = Array.isArray(x) ? new RegExp(x[0], x[1]) : new RegExp(x)
                for await (let i of session.bot.getMessageIter(session.channelId)) {
                    if (x === i.content || r.test(i.content)) {
                       return [i.content, i.id, i.user.name, i.user.id]
                    }
                }
            },
            sleep: async (x : any) => void await new Promise((res) => setTimeout(res, x * 1000)),
        }, what.default_var_dict),
        (x : any) => void output.push(h.text(x)),
    )
    return output
}
const try_run_what = async (code : string, session : Session) => {
    try {return await run_what(code, session)}
    catch (e) {return h.escape(String(e))}
}

export function apply(ctx : Context, config: Config) {
    ctx.command("whatlang <code:rawtext>", "运行 WhatLang 代码")
        .usage(h.escape(
            "可直接用 '¿<code>' 代替\n" +
            "输入 '¿help@' 获取帮助"
        ))
        .example(h.escape("¿ `Hello, world! `"))
        .example(h.escape("¿ 10 range@ (2 + 2 pow@ 1 +.` `)#"))
        .example(h.escape("¿ 0x=_ 10n=_ 1.:{` `:x^+.\\x=_n^1-n=}"))
        .example(h.escape('¿ (http://spiderbuf.cn) link= (/s05)+ cat@ [((?<=<img.*?src=").*?(?=".*?>))g]match@ (link^ \+ outimg@send@)#'))
        .action(({ session }, code) => try_run_what(code, session))
    ctx.middleware(async (session, next) => {
        if (!session.isDirect && session.resolve(config.requireAppel) && !session.stripped.appel) return next()
        let content : string = h.select(session.stripped.content, "text").map(e => e.attrs.content).join("")
        if (content.startsWith("¿")) {
            return await try_run_what(content.slice(1), session)
        } else {
            return next()
        }
    })
}