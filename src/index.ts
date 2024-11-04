// ©2024 - Custom Database API - BestMat, Inc. - All rights reserved.
import { createWriteStream, readFile, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type CallbackFunction = (error: Error | null, data: { code: number }) => void;

export type Char = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" 
| "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" 
| "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" 
| "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" 
| "Y" | "Z" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type DateObject = {
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
    seconds: number,
    millisec: number
};

type ReturnDataScheme = "string" | "date" | "char" | "number" | "error";

export default class Database {
    public schema = {};
    public fileName: string;

    constructor(name: string, isNew?: boolean) {
        if (isNew) {
            this.create({ name: name });
            this.fileName = "";
        } else {
            const dir = path.join(__dirname, "db_");
            this.fileName = dir + `${name}.json`
        }
    }

    private create(config: {
        name: string
    }): void {
        const dir = path.join(__dirname, "db_");

        createWriteStream(dir + `${config.name}.json`);
        this.fileName = dir + `${config.name}.json`;
    };

    public get(): Array<object> {
        return JSON.parse(readFileSync(this.fileName).toString());
    };

    public async deleteDB(): Promise<void> {
        await Deno.remove(this.fileName);
    };

    public delete(index: number): void {
        const data = JSON.parse(Deno.readTextFileSync(this.fileName));

        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        Deno.writeFileSync(this.fileName, removeItem(data, index));
    }

    public add(schema: object, callback: CallbackFunction): void {
        const fileName = this.fileName; // very useful code
        const object = {};

        for (let i = 0; i < (Object.keys(schema)).length; i++) {
            if (Object.values(this.schema)[i] !== type(Object.values(schema)[i])) {
                throw new DatabaseError(`Typeof ${Object.values(schema)[i]} is not matching with Database Schema`);
            }

            // deno-lint-ignore ban-ts-comment
            // @ts-ignore
            object[Object.keys(schema)[i]] = Object.values(schema)[i];
        }

        readFile(fileName, function(err, data) {
            if (err) throw new DatabaseError(String(err));

            if (String(data) == "") {
                writeFileSync(fileName, JSON.stringify([object]));
                (callback)(null, { code: 200 });
            } else {
                const oldData = JSON.parse(data.toString()); // buffer -> string -> object
                oldData.push(object);

                writeFileSync(fileName, JSON.stringify(oldData));
            }
        });
    };
};

class DatabaseError extends Error {
    constructor(error: string) {
        super(`DatabaseError: ${error}.`)
    }
};

// deno-lint-ignore no-explicit-any
export function type(variable: any): ReturnDataScheme {
    if (typeof variable !== "object") {
        if (isNaN(variable)) { // String or a Character
            if (variable.length === 1) {
                return "char";
            } else {
                return "string";
            }
        } else {
            return "number";
        }
    } else {
        if (variable.message) {
            return "error";
        } else {
            return "date";
        }
    }
};

function removeItem<T>(arr: Array<T>, index: number): Array<T> {
    arr.splice(index, 1);
    return arr;
};

export function char(character?: string): DatabaseError | string | ReturnDataScheme {
    if (character) {
        return character;
    } else {
        return "char";
    }
};

export function string(character?: string): DatabaseError | string | ReturnDataScheme {
    if (character) {
        if (typeof character != "string") {
            throw new DatabaseError("Not a string");
        } else {
            return character;
        }
    } else {
        return "string";
    }
};

export function number(num?: number): number | ReturnDataScheme {
    if (num) {
        return Number(num);
    } else {
        return "number";
    }
}

export function error(err?: Error): Error | ReturnDataScheme {
    if (err) {
        return err;
    } else {
        return "error";
    }
}

export function date(d?: Date): DateObject | ReturnDataScheme {
    if (d) {
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDay();
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();
        const millisec = d.getMilliseconds();

        return {
            year: year,
            month: month,
            day: day,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            millisec: millisec
        };
    } else {
        return "date";
    }
};

// const db = new Database("hello");

// db.schema = {
//     name: string(),
//     date: date(),
//     randomChar: char()
// }

// db.add({
//     name: string("HHHH"),
//     date: date(new Date()),
//     randomChar: char("Y")
// }, (error, data) => {
//     if (error) console.error(error);
//     console.log(data);
// });

// console.log(db.get())