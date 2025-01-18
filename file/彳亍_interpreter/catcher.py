(
    CD := __import__("contextlib").ContextDecorator,

    Catcher := type("Catcher", (CD,), dict(
        __enter__ = lambda self: self,
        __exit__ = lambda self, *err: setattr(self, "err", err) and True,
    )),
    TFcatcher := lambda funcT, funcF: (
        catT := Catcher(),
        catF := Catcher(),
        resT := catT(funcT)(),
        resF := catF(lambda: funcF(catT.err))(),
        (resT, catT.err, resF, catF.err)
    )[-1],
    TPwith := lambda *args: (
        ctx := tuple(i.__enter__() for i in args[:-1]),
        TFcatcher(
            lambda: args[-1](*ctx),
            lambda err: tuple(i.__exit__(err) for i in ctx[::-1]),
        )
    )[-1],
)
