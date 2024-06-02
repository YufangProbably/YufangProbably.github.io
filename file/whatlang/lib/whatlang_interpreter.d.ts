declare var default_var_dict: Record<string, any>;
declare const formatting: (x: any) => string;
declare const exec_what: (fstack: any[][], var_dict: Record<string, any>, output: (x: any) => void) => Promise<any>;
declare const run_what: (code: string, var_dict?: Record<string, any>) => Promise<{
    stack: any;
    output: string;
}>;
declare const eval_what: (code: string, fstack: any[][], var_dict: Record<string, any>, output?: (x: any) => void) => Promise<any>;
export { formatting, exec_what, eval_what, run_what, default_var_dict };
