import { Computed, Context, Schema, Session, h, escapeRegExp } from 'koishi'
import * as what from './whatlang_interpreter'

export const name = 'whatlang'
export interface Config {
  requireAppel: Computed<boolean>,
}
export const Config = Schema.object({
  requireAppel: Schema.computed(Boolean).description("在群聊中，使用“¿”快捷方式是否必须 @ bot 或开头带昵称。").default(false),
})

const run_what = async (code : string, session : Session) => {
    let output : (h | string)[] = []
    let stack : any = await what.eval_what(
        code, [[]], 
        Object.assign({
            prompt: async () => session.prompt(),
            uprompt: async (x : any) => {
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
                            res(session2.stripped.content)
                            dispose()
                        })
                    )
                    const timeout = setTimeout(() => {
                        dispose()
                        res(undefined)
                    }, session.app.app.config.delay.prompt)
                    return
                })
            },
            cat: async (x : any) => {
                try {return await session.app.http.get(String(x), {responseType: "text"})}
                catch (err) {session.send(String(err)); return}
            },
            outimg: async (x : any) => {output.push(h.image(x)); return},
            outaudio: async (x : any) => {output.push(h.audio(x)); return},
            outvideo: async (x : any) => {output.push(h.video(x)); return},
            outfile: async (x : any) => {output.push(h.file(x)); return},
            outquote: async (x : any) => {output.push(h.quote(x)); return},
            sendimg: async (x : any) => {await session.send(h.image(x)); return},
            sendaudio: async (x : any) => {await session.send(h.audio(x)); return},
            sendvideo: async (x : any) => {await session.send(h.video(x)); return},
            sendfile: async (x : any) => {await session.send(h.file(x)); return},
            sendhtml: async (x : any) => {await session.send(h("html", {}, [h("div", {style: {
                padding: "5px",
                "max-width": "96ch",
                "font-family": "Consolas",
                "overflow-wrap": "break-word",
                "white-space": "break-spaces",
            }}, [typeof x == "string" ? x : what.formatting(x)])])); return},
            send: async (x : any) => {await session.send(
                h.escape(typeof x == "string" ? x : what.formatting(x))
            ); return},
            reesc: (x : any) => escapeRegExp(x),
            msgre: async (x : any) => {
                const r : RegExp = Array.isArray(x) ? new RegExp(x[0], x[1]) : new RegExp(x)
                for await (let i of session.bot.getMessageIter(session.channelId)) {
                    if (x == r || r.test(i.content)) return [i.content, i.id, i.user.id]
                }
            },
            sleep: async (x : any) => {await new Promise ((res) => setTimeout(res, x * 1000)); return},
        }, what.default_var_dict),
        (x : any) => output.push(x),
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
            "可直接用 '¿<code>' 代替"
        ))
        .example(h.escape("¿ `Hello, world! `"))
        .example(h.escape("¿ 10 range@ (2 + 2 pow@ 1 +.` `)#"))
        .example(h.escape("¿ 0x=_ 10n=_ 1.:{` `:x^+.\\x=_n^1-n=}"))
        .example(h.escape('¿ (http://spiderbuf.cn) link= (/s05)+ cat@ [((?<=<img.*?src=").*?(?=".*?>))g]match@ (link^ \+ sendimg@)#'))
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