(
    sys := __import__("sys"),
    self := sys.modules[__name__],
    setattr(self, "HQ9+fuck_interpreter", lambda
        code,
        bottle_count = 99,
        tape = [ord(i) for i in "Hello, World! \x00"],
        stdout = sys.stdout,
        stderr = sys.stderr,
        stdin = sys.stdin,
    : (
        tape := tape.copy(),
        tape_index := 0, code_index := 0,
        flag := dict.fromkeys("HQ+", False),
        stack := [], breaks := [],
        fucked := False, bottles := 0, any_of_hqn := False,
        lasts := (tape, flag, tape_index),
        output := [""], last_output := output[0],
        prints := lambda s, file = stdout: (
            file.write(s),
            output.append(output.pop() + s),
        ) if not flag["H"] else None,
        bottling := lambda x: (
            f"{x} bottle{(T := 's' if x != 1 else '')} of beer on the wall,\n"
            f"{x} bottle{T} of beer.\n"
            f"Take one down, pass it around,\n"
            f"{x-1 if x != 1 else 'No'} bottle{'s' if x != 2 else ''} of beer on the wall."
            f"{chr(10)*2 if x != 1 else ''}"
        ),
        format_dict := (
            dict.fromkeys("Hh", "H") |
            dict.fromkeys("Qq", "Q") |
            dict.fromkeys("9Nn", "9") |
            dict.fromkeys("+Pp", "+") |
            dict.fromkeys("Ff", "F")
        ), 
        [(
            current := code[code_index] if code_index < len(code) else "_",
            (
                (
                    prints("FuckError: You fucked too much", file = stderr),
                    breaks.append(True),
                ) if fucked else (fucked := True),
            ) if current in "Ff" else (
                (
                    bottles := bottles - 1,
                ) if fucked and bottles else (
                    bottles := bottles + 1,
                ) if not fucked and bool(tape[tape_index]) == flag["+"] else (
                    tape.pop(tape_index),
                    tape.insert(tape_index, 99),
                    stack.append(code_index),
                ) if not fucked and bool(tape[tape_index]) != flag["+"] else (
                    stack.pop(),
                ) if fucked and bool(tape[tape_index]) == flag["+"] else (
                    prints(bottling(tape[tape_index])),
                    tape.insert(tape_index, tape.pop(tape_index) - 1),
                    code_index := stack[-1] if stack else 0,
                ) if fucked and bool(tape[tape_index]) != flag["+"] else None,
                fucked := False,
            ) if current in "9Nn" else (
                None,
            ) if bottles else (
                flag.update({current: not flag[format_dict[current]]}),
                fucked := False,
            ) if current in "HhQq9Nn+Pp" and fucked else (
                prints(chr(tape[tape_index])),
                tape_index := (
                    tape_index + (-1 if flag["+"] else 1)
                ) % len(tape),
                any_of_hqn := True,
            ) if current in "Hh" else (
                (
                    tape.pop(tape_index),
                    tape.insert(tape_index, ord(stdin.read(1))),
                ) if flag["Q"] else (
                    tape := tape[:tape_index] + [ord(i) for i in code] + [0],
                ),
                any_of_hqn := True,
            ) if current in "Qq" else (
                tape.insert(
                    tape_index,
                    tape.pop(tape_index) + (-1 if flag["+"] else 1)
                ),
            ) if current in "+Pp" else None,
            code_index := code_index + 1,
            None if code_index < len(code) else (
                (
                    bottles := 0,
                ) if bottles else (
                    stack.pop(),
                    code_index := 0,
                ) if bool(tape[tape_index]) == flag["+"] else (
                    prints(bottling(tape[tape_index])),
                    tape.insert(tape_index, tape.pop(tape_index) - 1),
                    code_index := stack[-1] + 1,
                ) if bool(tape[tape_index]) != flag["+"] else None,
            ) if stack else (
                breaks.append(True)
            ) if (
                not tape[tape_index]
                or lasts == (tape, flag, tape_index)
                or last_output == output[0]
            ) else (
                code_index := 0,
            ),
            None if code_index < len(code) else (
                lasts := (tape, flag, tape_index),
                last_output := output[0],
            ),
        ) for i in iter(lambda: not breaks, 0)],
        (
            prints("".join(chr(i) for i in tape))
        ) if not output[0] and any_of_hqn else None,
        (tape, output)
    )[-1]),
    None if __name__ != "__main__" else (
        code := sys.argv[1] if len(sys.argv) > 1 else input(),
        getattr(self, "HQ9+fuck_interpreter")(code),
    ),
)
