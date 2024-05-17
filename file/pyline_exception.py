(
    ctxdeco := __import__("contextlib").ContextDecorator,

    TFcatcherType := type("TFcatcherType", (ctxdeco,), dict(
        __init__ = lambda self, funcF = None, raises = False: (
            setattr(self, "funcF", funcF),
            setattr(self, "raises", raises),
            None
        )[-1],
        __enter__ = lambda self: (
            self,
        )[-1],
        __exit__ = lambda self, *exc: (
            None if self.funcF is None else (
                catch := TFcatcherType(),
                setattr(
                    self, "resultF",
                    catch(lambda: self.funcF(exc))()
                ),
                setattr(self, "excF", catch.exc),
            ),
            setattr(self, "exc", exc),
            not self.raises
        )[-1],
    )),

    no_error := lambda exc: exc == (None, None, None),
    TFcatcher := lambda funcT, funcF = lambda: None, raises = False: (
        catch := TFcatcherType(funcF, raises),
        resultT := catch(funcT)(),
        (resultT, catch.exc, catch.resultF),
    )[-1],
    TEEFcatcher := lambda funcT, funcE, funcEl, funcF: (
        catch := TFcatcherType(lambda exc: (
            funcEl() if no_error(exc) else funcE(exc)
        ), False),
        resultT := catch(funcT)(),
        TFcatcher(funcF, lambda: None),
        None if no_error(catch.excF) else (
            exc := catch.excF[1].with_traceback(catch.excF[2]),
            (_ for _ in ()).throw(exc),
        ),
        (resultT, catch.exc, catch.resultF, catch.excF),
    )[-1],
    TPwith := lambda ctx, func: (
        ctx := ctx.__enter__(),
        result := TFcatcher(
            lambda: func(ctx),
            lambda e: ctx.__exit__(),
            True
        ),
        result[0]
    )[-1],



    None if __name__ != "__main__" else (
        separate := lambda: print(f"{' I'+chr(39)+'m a separator ':=^48}"),
        
        reciprocal := lambda x: TEEFcatcher(
            lambda: 1 / x,
            lambda e: print(f":Oh shit, {e[1]}"),
            lambda: print(":Good"),
            lambda: print(":Finally"),
        )[0],
        print(f"We got {reciprocal(2)} here"),
        separate(),
        print(f"We got {reciprocal(0)} here"),
        separate(),
        
        TPwith(open(__file__), lambda f: (
            print("ehehe qnuie"),
            print(f.readlines()[3].strip()),
        )),
        separate(),

        TEEFcatcher(
            lambda: 1 / 0,
            lambda e: [][0],
            lambda: print(":Good"),
            lambda: print(":Finally... wait what? "),
        ),
    ),
)
