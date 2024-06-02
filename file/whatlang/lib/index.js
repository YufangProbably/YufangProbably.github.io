"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.name = void 0;
const koishi_1 = require("koishi");
const what = __importStar(require("./whatlang_interpreter"));
exports.name = 'whatlang';
exports.Config = koishi_1.Schema.object({});
const run_what = async (code, session) => {
    let output = [];
    let stack = await what.eval_what(code, [[]], Object.assign({
        prompt: async () => session.prompt(),
        uprompt: async (x) => {
            return new Promise(res => {
                const dispose = (session.app
                    .platform(session.platform)
                    .channel(session.channelId)
                    .middleware((session2, next) => {
                    if (x &&
                        session2.userId != x &&
                        !(Array.isArray(x) && x.includes(session2.userId)))
                        return next();
                    if (session2.cid != session.cid)
                        return next();
                    clearTimeout(timeout);
                    res(session2.stripped.content);
                    dispose();
                }));
                const timeout = setTimeout(() => {
                    dispose();
                    res(undefined);
                }, session.app.app.config.delay.prompt);
                return;
            });
        },
        cat: async (x) => {
            try {
                return await session.app.http.get(String(x), { responseType: "text" });
            }
            catch (err) {
                session.send(String(err));
                return;
            }
        },
        outimg: async (x) => { output.push(koishi_1.h.image(x)); return; },
        outaudio: async (x) => { output.push(koishi_1.h.audio(x)); return; },
        outvideo: async (x) => { output.push(koishi_1.h.video(x)); return; },
        outfile: async (x) => { output.push(koishi_1.h.file(x)); return; },
        outquote: async (x) => { output.push(koishi_1.h.quote(x)); return; },
        sendimg: async (x) => { await session.send(koishi_1.h.image(x)); return; },
        sendaudio: async (x) => { await session.send(koishi_1.h.audio(x)); return; },
        sendvideo: async (x) => { await session.send(koishi_1.h.video(x)); return; },
        sendfile: async (x) => { await session.send(koishi_1.h.file(x)); return; },
        sendquote: async (x) => { await session.send(koishi_1.h.quote(x)); return; },
        sendhtml: async (x) => {
            await session.send((0, koishi_1.h)("html", {}, [(0, koishi_1.h)("div", { style: {
                        padding: "5px",
                        "max-width": "96ch",
                        "font-family": "Consolas",
                        "overflow-wrap": "break-word",
                        "white-space": "break-spaces",
                    } }, [typeof x == "string" ? x : what.formatting(x)])]));
            return;
        },
        send: async (x) => {
            await session.send(koishi_1.h.escape(typeof x == "string" ? x : what.formatting(x)));
            return;
        },
        msgre: async (x) => {
            const r = Array.isArray(x) ? new RegExp(x[0], x[1]) : new RegExp(x);
            for await (let i of session.bot.getMessageIter(session.channelId)) {
                if (r.test(i.content))
                    return [i.content, i.id, i.user.id];
            }
        },
        sleep: async (x) => { await new Promise((res) => setTimeout(res, x * 1000)); return; },
    }, what.default_var_dict), (x) => output.push(x));
    return output;
};
const try_run_what = async (code, session) => {
    try {
        return await run_what(code, session);
    }
    catch (e) {
        return String(e);
    }
};
function apply(ctx) {
    ctx.command("whatlang <code:rawtext>", "运行 WhatLang 代码")
        .usage(koishi_1.h.escape("可直接用 '¿<code>' 代替"))
        .example(koishi_1.h.escape("¿ `Hello, world! `"))
        .example(koishi_1.h.escape("¿ 10 range@ (2 + 2 pow@ 1 +.` `)#"))
        .example(koishi_1.h.escape("¿ 0x=_ 10n=_ 1.:{` `:x^+.\\x=_n^1-n=}"))
        .example(koishi_1.h.escape('¿ (http://spiderbuf.cn) link= (/s05)+ cat@ [((?<=<img.*?src=").*?(?=".*?>))g]match@ (link^ \+ sendimg@)#'))
        .action(({ session }, code) => try_run_what(code, session));
    ctx.middleware(async (session, next) => {
        let content = koishi_1.h.unescape(session.stripped.content);
        if (session.content[0] == "¿") {
            try_run_what(koishi_1.h.unescape(session.content.slice(1)), session)
                .then(x => session.send(x))
                .catch(e => session.send("Error: " + koishi_1.h.escape(e)));
            return;
        }
        else {
            return next();
        }
    });
}
exports.apply = apply;
