const fs = require('fs');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const path = require("path");
require("../../process/algorithms/linq").linq();

var rd = require("../../data/database/api");

class Api {
    // constructor 
    constructor() {

    }
    //: init
    _default(id, port, upath) {
        return new Promise((resolve, reject) => {
            var d1 = rd.api(id); //console.log(JSON.stringify(d1), "E1");

            if (d1) {
                var t = d1.type;   //console.log(t, "E2");

                if (t == "sqlite") {
                    var p = path.join(upath, d1.path);

                    //: Connect to Database
                    function conn() {
                        //console.log("conn", "E6");
                        var db = new sqlite3.Database(p, (err) => {
                            if (err) {
                                resolve("400: " + err.message);
                            }
                            else {
                                exec(db);
                            }
                        })
                    }
                    function exec(db) {
                        function tabs() {
                            return new Promise((rs, rj) => {
                                var d = [];
                                var z = "SELECT * FROM sqlite_schema WHERE type='table'";
                                var k = 0;

                                function rn() {
                                    db.all(z, (err, rows) => {
                                        if (!err) {
                                            //console.log("rn", "E8");
                                            var ck = [];
                                            //console.log(JSON.stringify(rows), "E8");

                                            rows.forEach((s) => {
                                                ck.push([false]);
                                            });
                                            //: 
                                            function nx() {
                                                //console.log(JSON.stringify(ck), "Sq4");

                                                var n = true;
                                                ck.forEach((s) => {
                                                    s.forEach((s2) => {
                                                        if (!s2) {
                                                            n = false;
                                                        }
                                                    })
                                                })

                                                //console.log(n.toString() , "Sq5");

                                                if (n) {
                                                    rs(d);
                                                }
                                            }
                                            //:
                                            rows.forEach((s, k) => {
                                                var tb = { name: s.name };
                                                var sq = s.sql;

                                                sq = sq.slice(sq.indexOf("("));
                                                sq = sq.substring(0, sq.lastIndexOf(")"));

                                                var sql = sq.split(",");
                                                //: columns 
                                                cols(s.name, sql).then((c) => {

                                                    tb.cols = c;
                                                    d.push(tb);

                                                    ck[k][0] = true;
                                                    nx();
                                                });
                                                //:
                                            });

                                            //console.log(JSON.stringify(rows), "Sq6");  

                                            if (rows.length == 0) {
                                                rs(d);
                                            }
                                            //:
                                        }
                                        else {

                                            if ((err + "").indexOf("SQLITE_BUSY") != -1) {
                                                if (k < 120) {
                                                    k++;
                                                    setTimeout(function () { rn(); }, 1000);
                                                }
                                                else {
                                                    rs([]);
                                                }
                                            }
                                            else {
                                                rs([]);
                                            }
                                        }
                                    })
                                }

                                rn();
                            });

                        }
                        function cols(tab, sql) {
                            return new Promise((rs, rj) => {
                                //console.log("cols", "E9");
                                //console.log(JSON.stringify(tab), "S1"); 
                                //console.log(JSON.stringify(sql), "S2");

                                var d = [];

                                var z = "SELECT m2.* "
                                    + "FROM sqlite_schema AS m1 , pragma_table_info(m1.name) AS m2 "
                                    + "WHERE m1.type='table' AND m1.name='" + tab + "' ";

                                fn();
                                function fn()
                                { 
                                    db.all(z, (err, rows) => {
                                        if (!err) {

                                            //console.log(JSON.stringify(rows), "S3");

                                            rows.forEach((s, k) => {
                                                var cn = {
                                                    name: s.name,
                                                    type: s.type,
                                                    constr: constr(sql, s)
                                                };

                                                //console.log(JSON.stringify(cn), "Sq1");

                                                d.push(cn);

                                            });

                                            //console.log(JSON.stringify(d), "Sq2");

                                            rs(d);
                                        }
                                        else {
                                            if ((err + "").indexOf("SQLITE_BUSY") != -1) {
                                                if (k < 120) {
                                                    k++;
                                                    setTimeout(function () { fn(); }, 500);
                                                }
                                                else {
                                                    console.log("2 : " + err.message);
                                                }
                                            }
                                            else {

                                                console.log("2 : " + err.message);
                                            }
                                        }
                                    })
                                }

                            })
                        }
                        function constr(sql, c) {
                            //console.log(JSON.stringify(sql), "S5");
                            //console.log(JSON.stringify(c), "S6");

                            var arr = [];

                            try {
                                sql.forEach((f) => {
                                    var s = f;

                                    //console.log(f, "S7");

                                    if (s.indexOf(c.name) != -1) {
                                        var m = ["PRIMARY KEY", "COLLATE ", "GENERATED ALWAYS AS", "AS", "DEFAULT (",
                                            "CHECK (", "NOT NULL ", "NULL ", "UNIQUE ", "REFERENCES "];

                                        for (var k = 0; k < m.length; k++) {
                                            var nm = m[k].toLowerCase().replaceAll(" ", "");
                                            nm = (nm == "generatedalwaysas" || nm == "as") ? "generated" : nm;
                                            nm = (nm == "notnull" || nm == "null") ? "notnull" : nm;
                                            nm = (nm == "default(") ? "default" : nm;
                                            nm = (nm == "check(") ? "check" : nm;
                                            nm = (nm == "primarykey") ? "pk" : nm;
                                            nm = (nm == "references") ? "fk" : nm;

                                            //console.log(k.toString(), "Q1");
                                            //console.log(nm, "Q2");
                                            //console.log(s.indexOf(m[k]).toString() , "q1");

                                            if (s.indexOf(m[k]) != -1) {

                                                var b1 = s.substring(0, s.indexOf(m[k])).trim().split(" "); //console.log(JSON.stringify(b1), "q2");
                                                var b2 = (b1[b1.length - 2]); //console.log(JSON.stringify(b2), "q2");
                                                var cn = (b2 == "CONSTRAINT") ? b1[b1.length - 1] : null;

                                                var t1 = s.lastIndexOf("CONSTRAINT");

                                                var u = "";

                                                if (k == 0) {
                                                    u = "true";
                                                }
                                                else if (k == 1) {
                                                    u = s.slice(s.indexOf(m[k]) + m[k].length);
                                                    if (u.indexOf(" ") != -1) {
                                                        u = u.substring(0, u.indexOf(" "));
                                                    }
                                                }
                                                else if (k == 4) {
                                                    u = s.slice(s.indexOf(m[k]) + m[k].length);
                                                    if (u.indexOf(")") != -1) {
                                                        u = u.substring(0, u.indexOf(")"));
                                                    }
                                                }
                                                else if (k == 5) {
                                                    u = s.slice(s.indexOf(m[k]) + m[k].length);
                                                    if (u.indexOf(")") != -1) {
                                                        u = u.substring(0, u.indexOf(")"));
                                                    }
                                                }
                                                else if (k == 6) {
                                                    u = "true";
                                                }
                                                else if (k == 7) {
                                                    u = "false";
                                                }
                                                else if (k == 8) {
                                                    u = "true";
                                                }
                                                else {
                                                    u = s.slice(s.indexOf(m[k]) + m[k].length);
                                                }
                                                //console.log(u, "z2");
                                                //console.log(t1.toString() , "q2");

                                                if (t1 == -1) // Pending Constraints have no name 
                                                {
                                                    var w = {};

                                                    //console.log(u, "Q3");

                                                    w = (k == 9) ? _fkey(u, w) : w;
                                                    w = (k == 0) ? _pkey(u, w) : w;
                                                    w = (k == 7) ? _unique(u, w) : w;
                                                    w = (k == 6 || k == 5) ? _notnull(u, w) : w;
                                                    w = (k == 2 || k == 1) ? _generated(u, w) : w;

                                                    w[nm] = u;
                                                    w["name_" + (k + 1)] = null;

                                                    //console.log(JSON.stringify(w), "Q4");

                                                    arr.push(w)
                                                }
                                                else {
                                                    var m2 = m.Where((i) => i != m[k]).Select((i) => { s.indexOf(i); }).Max();

                                                    if (t1 > m2) // current Constraint has name 
                                                    {
                                                        var n = cn;
                                                        var w = {};

                                                        //console.log(u, "Q4");

                                                        w = (k == 9) ? _fkey(u, w) : w;
                                                        w = (k == 0) ? _pkey(u, w) : w;
                                                        w = (k == 8) ? _unique(u, w) : w;
                                                        w = (k == 6 || k == 5) ? _notnull(u, w) : w;
                                                        w = (k == 2 || k == 1) ? _generated(u, w) : w;

                                                        w[nm] = u;
                                                        w["name_" + (k + 1)] = n;

                                                        //console.log(JSON.stringify(w), "Q6");

                                                        arr.push(w);

                                                    }
                                                    else        // current Constraint has no name 
                                                    {
                                                        var w = {};
                                                        var u = s.slice(s.indexOf(m[k]) + m[k].length);

                                                        //console.log(u, "Q7");

                                                        w = (k == 9) ? _fkey(u, w) : w;
                                                        w = (k == 0) ? _pkey(u, w) : w;
                                                        w = (k == 8) ? _unique(u, w) : w;
                                                        w = (k == 6 || k == 5) ? _notnull(u, w) : w;
                                                        w = (k == 2 || k == 1) ? _generated(u, w) : w;

                                                        w[nm] = u;
                                                        w["name_" + (k + 1)] = null;

                                                        //console.log(JSON.stringify(w), "Q8");

                                                        arr.push(w);
                                                    }
                                                }

                                                if (k == 0) {
                                                    s = s.replace(m[0], "");
                                                }
                                                else if (k == 1) {
                                                    s = s.replace(m[1], "");
                                                    s = s.replace(u, "");
                                                }
                                                else if (k == 4) {
                                                    var a1 = s.indexOf(m[k]);
                                                    var a2 = s.indexOf(")", a1) + 1;

                                                    s = s.substring(0, a1) + s.slice(a2);
                                                }
                                                else if (k == 5) {
                                                    var a1 = s.indexOf(m[k]);
                                                    var a2 = s.indexOf(")", a1) + 1;

                                                    s = s.substring(0, a1) + s.slice(a2);
                                                }
                                                else if (k == 6) {
                                                    s = s.replace(m[6], "");
                                                }
                                                else if (k == 7) {
                                                    s = s.replace(m[7], "");
                                                }
                                                else if (k == 8) {
                                                    s = s.replace(m[8], "");
                                                }
                                                else {
                                                    s = s.substring(0, s.indexOf(m[k])).trim();
                                                }

                                                s = s.replace("CONSTRAINT " + cn, "");

                                                //console.log(s , "Q9");
                                            }
                                        }

                                    }

                                });

                            }
                            catch (ex) {
                                console.log(ex, "P1");
                            }

                            //console.log(JSON.stringify(arr), "P2");

                            return arr;
                        }
                        //: Constraints  
                        function _pkey(str, w) {
                            var ret = w;
                            var s = str;

                            var m = ["AUTOINCREMENT ", "ON CONFLICT ", "ASC ", "DESC "];

                            try {
                                if (s.indexOf(m[0]) != -1) {
                                    ret["autoincrement"] = true;
                                    s = s.substring(0, s.indexOf(m[0]));
                                }

                                if (s.indexOf(m[1]) != -1) {
                                    ret["p_conflict"] = s.slice(s.indexOf(m[1]) + m[1].Length);
                                    s = s.substring(0, s.indexOf(m[1]));
                                }

                                if (s.indexOf(m[2]) != -1) {
                                    ret["sortorder"] = "ASC";
                                    s = s.substring(0, s.indexOf(m[2]));
                                }

                                if (s.indexOf(m[3]) != -1) {
                                    ret["sortorder"] = "DESC";
                                    s = s.Substring(0, s.indexOf(m[3]));
                                }
                            }
                            catch (ex) {
                                console.log(ex, "E21");
                            }

                            return ret;
                        }
                        function _fkey(str, w) {
                            //console.log("fkey", "E11");
                            var ret = w;
                            var s = str;

                            var m = ["(", ")", "MATCH", "INITIALLY", "ON UPDATE", "ON DELETE"];

                            if (s.indexOf(m[0]) != -1 && s.indexOf(m[1]) != -1) {
                                ret.table = s.substring(0, s.indexOf(m[0])).trim();
                                ret.col = s.substring(s.indexOf(m[0]) + 1, s.indexOf(m[1])).trim();

                                s = s.slice(s.indexOf(m[1]));
                            }

                            if (s.indexOf(m[3]) != -1) {
                                var a = s.slice(s.indexOf(m[3]) + m[3].length).trim().trim();
                                var b = a.split(" ");
                                a = a.replace(nx(b), "");

                                ret.initially = a;
                                s = s.substring(0, s.indexOf(m[3]));
                            }

                            if (s.indexOf(m[2]) != -1) {
                                var a = s.slice(s.indexOf(m[2]) + m[2].length).trim();
                                var b = a.split(" ");
                                a = a.replace(nx(b), "");

                                ret.match = a;
                                s = s.substring(0, s.indexOf(m[2]));
                            }

                            if (s.indexOf(m[4]) != -1) {
                                var a = s.slice(s.indexOf(m[4]) + m[4].length).trim();
                                var b = a.split(" ");
                                a = a.replace(nx(b), "");

                                ret.onupdate = a;
                                s = s.substring(0, s.indexOf(m[4]));
                            }

                            if (s.indexOf(m[5]) != -1) {
                                var a = s.slice(s.indexOf(m[5]) + m[5].length).trim();
                                var b = a.split(" ");
                                a = a.replace(nx(b), "");

                                ret.ondelete = a;
                                s = s.substring(0, s.indexOf(m[5]));
                            }

                            function nx(b) {
                                var b1 = b[b.length - 1].trim();

                                if (b1 == "DEFERRABLE" || b1 == "NOT DEFERRABLE") {
                                    ret.isdef = b1;
                                    return b1;
                                }

                                return null;
                            }

                            return ret;
                        }
                        function _generated(str, w) {
                            //console.log("generated", "E12");

                            var ret = w;
                            var s = str;

                            var m = [") ", "( ", "GENERATED ALWAYS AS ", "AS "];

                            if (s.indexOf(m[0]) != -1) {
                                var t1 = s.slice(s.indexOf(m[0]) + m[0].length).trim();

                                if (t1 != "") {
                                    ret.type = t1;
                                    s = s.substring(0, s.indexOf(m[0]));
                                }
                                if (s.indexOf(m[1]) != -1) {
                                    ret.code = s.slice(s.indexOf(m[1]) + m[1].length);
                                    s = s.substring(0, s.indexOf(m[1]));
                                }
                                if (s.indexOf(m[2]) != -1) {
                                    ret.gen = true;
                                    s = s.substring(0, s.indexOf(m[2]));
                                }
                                if (s.indexOf(m[3]) != -1) {
                                    ret.gen = false;
                                    s = s.substring(0, s.indexOf(m[3]));
                                }
                            }

                            return ret;
                        }
                        function _notnull(str, w) {
                            //console.log("notnull", "E13");

                            var ret = w;
                            var s = str;

                            var m = ["ON CONFLICT ", "NOT NULL ", "NULL "];

                            if (s.indexOf(m[0]) != -1) {
                                ret.n_conflict = s.slice(s.indexOf(m[0]) + m[0].length);
                                s = s.substring(0, s.indexOf(m[0]));
                            }
                            if (s.indexOf(m[1]) != -1) {
                                ret.notnull = true;
                                s = s.substring(0, s.indexOf(m[1]));
                            }
                            if (s.indexOf(m[2]) != -1) {
                                ret.notnull = false;
                                s = s.substring(0, s.indexOf(m[1]));
                            }

                            return ret;
                        }
                        function _unique(str, w) {
                            //console.log("unique", "E14");
                            var ret = w;
                            var s = str;

                            var m = ["ON CONFLICT ", "UNIQUE "];

                            if (s.indexOf(m[0]) != -1) {
                                ret.u_conflict = s.slice(s.indexOf(m[0]) + m[0].length);
                                s = s.substring(0, s.indexOf(m[0]));
                            }

                            if (s.indexOf(m[1]) != -1) {
                                ret.unique = true;
                                s = s.substring(0, s.indexOf(m[1]));
                            }

                            return ret;
                        }
                        //:  
                        //: Current Database 
                        tabs().then((ds) => {
                            //console.log(JSON.stringify(r), "Tab Result");

                            resolve(ds);
                        })
                        //: 
                    }
                    //: 
                    //: Create File
                    if (!fs.existsSync(p)) {
                        //console.log("1", "FF");
                        //: Create Path 
                        var r = "";
                        var q = p.substring(0, p.lastIndexOf("\\")).split("\\");

                        q.forEach((s, k) => {
                            if (k == 0) { r = s; }
                            else { r += "\\" + s; }

                            if (!fs.existsSync(r)) {
                                fs.mkdirSync(r);
                            }
                        });
                        //: Download Content Database
                        //console.log("2", "FF");
                        //:
                        axios.get("http://localhost:" + port + "/assets/db/Database.db", { responseType: "arraybuffer" })
                            .then((r) => {
                                //console.log("3", "FF");
                                var d = Buffer.from(r.data);
                                fs.writeFile(p, d, function (err) {
                                    //console.log(err, "F5");
                                    if (err) {
                                        resolve("400:Error } " + err);
                                    }
                                    else {
                                        //resolve("Created file } " + p);
                                        conn();
                                    }
                                });

                            })
                            .catch((e) => {
                                //console.log("4", "FF");
                                reject(e);
                            });
                    }
                    else {
                        //console.log("5", "EE");
                        //resolve("Sqlite Database Found");
                        conn();
                    }
                    //:
                }
                else {
                    console.log(t + " functionality not found");
                    resolve([]);
                }
            }

        });
    }
    init(id, port, ds = [], upath , exs = false) {
        var ts = this;
        return new Promise(async (resolve, reject) => {
            var d1 = rd.api(id); //console.log(JSON.stringify(d1), "E1");
            var def = await ts._default(id, port, upath);

            if (d1) {
                var t = d1.type;  //console.log(t, "E2");

                if (t == "sqlite") {
                    var p = path.join(upath, d1.path); //console.log(p, "E3");
                    var dp = path.join(upath, "database"); //console.log(dp, "E4");

                    if (!fs.existsSync(dp)) {
                        fs.mkdir(dp, { recursive: true });
                    }
                    if (exs == true)
                    {
                        if (fs.existsSync(p))
                        {
                            resolve();
                            return;
                        }
                    }

                    fs.readdirSync(dp).forEach((s) => {
                        var dd = path.join(dp, s);  //console.log(dd, "E5");

                        if (p != dd)
                        {
                            var bs = 0;
                            nex();
                            function nex() {
                                try {
                                    fs.rmSync(dd, { force: true });
                                }
                                catch (e) {
                                    if ((e + "").indexOf("BUSY") != -1 && (e + "").indexOf("is a directory") == -1)
                                    {
                                        setTimeout(function ()
                                        {
                                            if (bs < 60*60) {
                                                bs++;
                                                nex();
                                            }
                                            else {
                                                console.log(e);
                                            }

                                        }, 1000);
                                    }
                                }
                            }
                        }
                    })
                    //: Connect to Database
                    function conn() {
                        //console.log("conn", "E9");
                        var db = new sqlite3.Database(p, (err) => {
                            if (err) {
                                resolve("400: " + err);
                            }
                            else {
                                exec(db);
                            }
                        })
                    }
                    function exec(db1) {
                        //console.log("exec", "E10");
                        //: Current Transaction 
                        function trans(db) {
                            //console.log("trans", "E11");
                            var rn = [];
                            var rt = 0;

                            d1.tables.forEach((s, k) => {
                                var q = "";

                                function column(tb) {
                                    var co1 = def.Where(i => i.name == tb)[0].cols;
                                    var co2 = s.cols;

                                    var qr = "PRAGMA foreign_keys = 0; \n\n";

                                    qr += "CREATE TABLE " + tb.toLowerCase() + "_temp AS SELECT * \n FROM " + tb + "; \n\n";

                                    qr += "DROP TABLE " + tb + ";\n\n";


                                    qr += "CREATE TABLE " + tb + " ( \n";
                                    //:cols 2
                                    for (var k2 = 0; k2 < co2.length; k2++) {
                                        var s2 = co2[k2];

                                        qr += "    " + s2.name[0] + " ";
                                        qr += s2.type + " ";

                                        if (s2.size != null && s2.size > 0) {
                                            qr += "(" + s2.size + ") ";
                                        }

                                        if (s2.constr != null) {
                                            if (s2.constr.fk != null) {
                                                if (s2.constr.fk.table != null && s2.constr.fk.col != null) {
                                                    if (s2.constr.fk.name != null) {
                                                        qr += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                    }

                                                    qr += "REFERENCES " + s2.constr.fk.table
                                                        + " (" + s2.constr.fk.col + ") ";

                                                    if (s2.constr.fk.ondelete != null) {
                                                        qr += "ON DELETE " + s2.constr.fk.ondelete + " ";
                                                    }
                                                    if (s2.constr.fk.onupdate != null) {
                                                        qr += "ON UPDATE " + s2.constr.fk.onupdate + " ";
                                                    }
                                                    if (s2.constr.fk.match != null) {
                                                        qr += "MATCH " + s2.constr.fk.match + " ";
                                                    }
                                                }
                                            }
                                            if (s2.constr.unique != null) {
                                                if (s2.constr.unique.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                }
                                                if (s2.constr.unique.val) {
                                                    qr += "UNIQUE ";
                                                }

                                                if (s2.constr.unique.conflict != null) {
                                                    qr += "ON CONFLICT " + s2.constr.unique.conflict + " ";
                                                }
                                            }

                                            if (s2.constr.notnull != null) {
                                                if (s2.constr.notnull.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr.notnull.name + " ";
                                                }

                                                if (s2.constr.notnull.val == true) {
                                                    qr += "NOT NULL ";
                                                }
                                                else {
                                                    qr += "NULL ";
                                                }

                                                if (s2.constr.notnull.conflict != null) {
                                                    qr += "ON CONFLICT " + s2.constr.notnull.conflict + " ";
                                                }
                                            }

                                            if (s2.constr.check != null) {
                                                if (s2.constr.check.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr.check.name + " ";
                                                }
                                                if (s2.constr.check.check != null) {
                                                    qr += "CHECK ( " + s2.constr.check.check + " ) ";
                                                }
                                            }

                                            if (s2.constr._default != null) {
                                                if (s2.constr._default.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr._default.name + " ";
                                                }
                                                if (s2.constr._default._default != null) {
                                                    qr += "DEFAULT " + s2.constr._default._default + " ";
                                                }
                                            }

                                            if (s2.constr.generated != null) {
                                                if (s2.constr.generated.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr.generated.name + " ";
                                                }

                                                if (s2.constr.generated.gen == true) {
                                                    qr += "GENERATED ALWAYS AS ";
                                                }
                                                else {
                                                    qr += "AS ";
                                                }
                                                if (s2.constr.generated.code != null) {
                                                    qr += "( " + s2.constr.generated.code + " ) ";
                                                }
                                                else {
                                                    qr += "() ";
                                                }

                                                if (s2.constr.generated.type != null) {
                                                    qr += s2.constr.generated.type + " ";
                                                }
                                            }

                                            if (s2.constr.collate != null) {
                                                if (s2.constr.collate.name != null) {
                                                    qr += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                }

                                                if (s2.constr.collate.collate != null) {
                                                    qr += "COLLATE " + s2.constr.collate.collate + " ";
                                                }
                                            }

                                            if (s2.constr.pk != null) {
                                                qr += "PRIMARY KEY ";

                                                if (s2.constr.pk.sortorder != null) {
                                                    qr += s2.constr.pk.sortorder + " ";
                                                }

                                                if (s2.constr.pk.onconflict != null) {
                                                    qr += "ON CONFLICT " + s2.constr.pk.onconflict + " ";
                                                }

                                                if (s2.constr.pk.autoincrement) {
                                                    qr += "AUTOINCREMENT ";
                                                }
                                            }
                                        }

                                        if (k2 != s.cols.length - 1) {
                                            qr += ", \n";
                                        }
                                        else {
                                            qr += " \n";
                                        }
                                    }
                                    // 
                                    qr += " ); \n\n";

                                    qr += "INSERT INTO " + tb + " ( \n";
                                    //: col 2 
                                    for (var k = 0; k < co2.length; k++) {
                                        var s1 = co2[k];
                                        if (s1.name.length > 0) {
                                            qr += s1.name[0];
                                            if (k != co2.length - 1) {
                                                qr += " , ";
                                            }
                                            qr += "\n";
                                        }
                                    }
                                    //
                                    qr += ") \n\n";
                                    qr += "SELECT \n";
                                    //: cols 
                                    for (var k = 0; k < co1.length; k++) {
                                        var s1 = co1[k];
                                        qr += s1.name;
                                        if (k != co1.length - 1) {
                                            qr += " , ";
                                        }
                                        qr += "\n";
                                    }
                                    //
                                    qr += "FROM " + tb.toLowerCase() + "_temp; \n\n";

                                    qr += "DROP TABLE " + tb.toLowerCase() + "_temp; \n\n";

                                    qr += "PRAGMA foreign_keys = 1; \n\n";

                                    //console.log(qr, "Rename Table Columns");

                                    q = qr;
                                }
                                function constrn(tb) {
                                    var ret = true;

                                    var co = def.Where(i => i.name == tb);
                                    if (co.length > 0) {
                                        try {
                                            var co1 = co[0].cols;
                                            var co2 = s.cols;

                                            co1.forEach((s1) => {
                                                co2.forEach((s2) => {
                                                    if (s2.constr != null && s1.constr != null) {
                                                        s1.constr.forEach((sc) => {
                                                            //console.log("Constr", "0");
                                                            //: pk 
                                                            try {
                                                                if (s2.constr.pk != null == sc["pk"] != null) {
                                                                    //: name 
                                                                    if ((s2.constr.pk.name != null) == (sc["name_1"] != null)) {
                                                                        if (sc["name_1"] != null) {
                                                                            if (s2.constr.pk.name == sc["name_1"]) { }
                                                                            else { ret = false; }
                                                                        }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: autoincrement 
                                                                    if (sc["autoincrement"] != null) {
                                                                        if (s2.constr.pk.autoincrement == sc["autoincrement"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else {
                                                                        if (s2.constr.pk.autoincrement) { ret = false; }
                                                                    }
                                                                    //: sortorder
                                                                    if (s2.constr.pk.sortorder != null == sc["sortorder"] != null) {
                                                                        if (sc["sortorder"] != null) {
                                                                            if (s2.constr.pk.sortorder == sc["sortorder"]) { }
                                                                            else { ret = false; }
                                                                        }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: conflict 
                                                                    if (s2.constr.pk.onconflict != null == sc["p_conflict"] != null) {
                                                                        if (sc["p_conflict"] != null) {
                                                                            if (s2.constr.pk.onconflict == sc["p_conflict"]) { }
                                                                            else { ret = false; }
                                                                        }
                                                                    }
                                                                    else { ret = false; }
                                                                    //:
                                                                }
                                                                else { ret = false; }
                                                                //console.log("PK", "1");
                                                            } catch { }
                                                            //: collate 
                                                            try {
                                                                if ((s2.constr.collate != null) && (sc["collate"] != null)) {
                                                                    //: name 
                                                                    if ((s2.constr.collate.name != null) && (sc["name_2"] != null)) {
                                                                        if (s2.constr.collate.name == sc["name_2"]) { }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: collate 
                                                                    if ((s2.constr.collate.collate != null) == (sc["collate"] != null)) {
                                                                        if (sc["name_2"] != null) {
                                                                            if (s2.constr.collate.collate == sc["collate"]) { }
                                                                            else { ret = false; }
                                                                        }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: 
                                                                }
                                                                else { ret = false; }
                                                                //console.log("Collate", "2");
                                                            } catch { }
                                                            //: generated
                                                            try {
                                                                if ((s2.constr.generated != null) == (sc["code"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr.generated.name != null == (sc["name_3"] != null) || (sc["name_4"] != null)) {
                                                                        if (s2.constr.generated.name == sc["name_3"]) { }
                                                                        else if (s2.constr.generated.name == sc["name_4"]) { }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: use "GENERATED ALWAYS" keywords 
                                                                    if (sc["gen"] != null) {
                                                                        if (s2.constr.generated.gen == sc["gen"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else {
                                                                        if (s2.constr.generated.gen) { ret = false; }
                                                                    }
                                                                    //: type  
                                                                    if (s2.constr.generated.type != null == (sc["type"] != null)) {
                                                                        if (s2.constr.generated.type == sc["type"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: code  
                                                                    if (s2.constr.generated.code != null == (sc["code"] != null)) {
                                                                        if (s2.constr.generated.code == sc["code"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //
                                                                }
                                                                else { ret = false; }
                                                                //console.log("Generated", "3");
                                                            } catch { }
                                                            //: default 
                                                            try {
                                                                if (s2.constr._default != null == (sc["default"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr._default.name != null == (sc["name_5"] != null)) {
                                                                        if (s2.constr._default.name == sc["name_5"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: default 
                                                                    if (s2.constr._default._default == sc["default"]) {

                                                                    }
                                                                    else { ret = false; }
                                                                    //: 
                                                                }
                                                                else { ret = false; }
                                                                //console.log("Default", "4");
                                                            } catch { }
                                                            //: check 
                                                            try {
                                                                if (s2.constr.check != null == (sc["check"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr.check.name != null == (sc["name_6"] != null)) {
                                                                        if (s2.constr.check.name == sc["name_6"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: check  
                                                                    if (s2.constr.check.check == sc["check"]) {

                                                                    }
                                                                    else { ret = false; }
                                                                    //: 
                                                                }
                                                                else { ret = false; }
                                                                //console.log("Check", "5");
                                                            } catch { }
                                                            //: notnull
                                                            try {
                                                                if (s2.constr.notnull != null == (sc["notnull"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr.notnull.name != null == (sc["name_7"] != null) || (sc["name_7"] != null)) {
                                                                        if (s2.constr.notnull.name == sc["name_7"]) {

                                                                        }
                                                                        else if (s2.constr.notnull.name == sc["name_7"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: notnull 
                                                                    if (sc["notnull"] != null) {
                                                                        if (s2.constr.notnull.val == sc["notnull"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else {
                                                                        if (s2.constr.notnull.val) { ret = false; }
                                                                    }
                                                                    //: conflict 
                                                                    if (s2.constr.notnull.conflict == sc["n_conflict"]) {

                                                                    }
                                                                    else { ret = false; }
                                                                    //
                                                                }
                                                                else { ret = false; }
                                                                //console.log("NotNull", "6");
                                                            } catch { }
                                                            //: unique
                                                            try {
                                                                if (s2.constr.unique != null == (sc["unique"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr.unique.name != null == (sc["name_9"] != null)) {
                                                                        if (s2.constr.unique.name == sc["name_9"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: unique 
                                                                    if (sc["unique"] != null) {
                                                                        if (s2.constr.unique.val == sc["unique"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: conflict 
                                                                    if (s2.constr.unique.conflict == sc["u_conflict"]) {

                                                                    }
                                                                    else { ret = false; }
                                                                    //
                                                                }
                                                                else { ret = false; }
                                                            } catch { }
                                                            //: fk 
                                                            try {
                                                                if (s2.constr.fk != null == (sc["table"] != null) && (sc["col"] != null)) {
                                                                    //: name 
                                                                    if (s2.constr.fk.name != null == (sc["name_10"] != null)) {
                                                                        if (s2.constr.fk.name == sc["name_10"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: table 
                                                                    if (s2.constr.fk.table != null == (sc["table"] != null)) {
                                                                        if (s2.constr.fk.table == sc["table"]) {
                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: col  
                                                                    if (s2.constr.fk.col != null == (sc["col"] != null)) {
                                                                        if (s2.constr.fk.col == sc["col"]) {
                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: initially  
                                                                    if (s2.constr.fk.initially != null == (sc["initially"] != null)) {
                                                                        if (s2.constr.fk.initially == sc["initially"]) {
                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: match  
                                                                    if (s2.constr.fk.match != null == (sc["match"] != null)) {
                                                                        if (s2.constr.fk.match == sc["match"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: onupdate 
                                                                    if (s2.constr.fk.onupdate != null == (sc["onupdate"] != null)) {
                                                                        if (s2.constr.fk.onupdate == sc["onupdate"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: ondelete 
                                                                    if (s2.constr.fk.ondelete != null == (sc["ondelete"] != null)) {
                                                                        if (s2.constr.fk.ondelete == sc["ondelete"]) {

                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: isdef  
                                                                    if (s2.constr.fk.isdef != null == (sc["isdef"] != null)) {
                                                                        if (s2.constr.fk.isdef == sc["isdef"]) {
                                                                        }
                                                                        else { ret = false; }
                                                                    }
                                                                    else { ret = false; }
                                                                    //: 

                                                                }
                                                                else { ret = false; }
                                                                //console.log("FK", "7");
                                                            } catch { }
                                                            //:
                                                        });
                                                    }
                                                    else {
                                                        ret = false;
                                                    }

                                                });
                                            });
                                        }
                                        catch //(Exception ex) 
                                        {
                                            //console.log( ex.Source + " : " + ex.Message, "Ex1"); 
                                        }
                                    }

                                    return ret;
                                };
                                function create() {
                                    var c = s.cols.Where(s2 => s2.name.length > 1).length == 0;
                                    //console.log(c.toString(), "G3");

                                    if (c)               //: Create Table
                                    {
                                        //console.log(JSON.stringify(s), "G4");

                                        var tb = s.name[0];

                                        var ex = constrn(tb);

                                        //console.log(ex.toString(), "G5");

                                        if (ex) {
                                            q += "CREATE TABLE " + tb + " (\n";

                                            for (var k2 = 0; k2 < s.cols.length; k2++) {
                                                var s2 = s.cols[k2];

                                                q += "    " + s2.name[0] + " ";
                                                q += s2.type + " ";

                                                if (s2.size != null && s2.size > 0) {
                                                    q += "(" + s2.size + ") ";
                                                }

                                                if (s2.constr != null) {
                                                    if (s2.constr.fk != null) {
                                                        if (s2.constr.fk.table != null && s2.constr.fk.col != null) {
                                                            if (s2.constr.fk.name != null) {
                                                                q += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                            }

                                                            q += "REFERENCES " + s2.constr.fk.table
                                                                + " (" + s2.constr.fk.col + ") ";


                                                            if (s2.constr.fk.ondelete != null) {
                                                                q += "ON DELETE " + s2.constr.fk.ondelete + " ";
                                                            }
                                                            if (s2.constr.fk.onupdate != null) {
                                                                q += "ON UPDATE " + s2.constr.fk.onupdate + " ";
                                                            }
                                                            if (s2.constr.fk.match != null) {
                                                                q += " MATCH " + s2.constr.fk.match + " ";
                                                            }
                                                        }
                                                    }
                                                    if (s2.constr.unique != null) {
                                                        if (s2.constr.unique.val) {
                                                            if (s2.constr.unique.name != null) {
                                                                q += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                            }

                                                            q += "UNIQUE ";

                                                            if (s2.constr.unique.conflict != null) {
                                                                q += "ON CONFLICT " + s2.constr.unique.conflict + " ";
                                                            }
                                                        }
                                                    }

                                                    if (s2.constr.notnull != null) {
                                                        if (s2.constr.notnull.name != null) {
                                                            q += "CONSTRAINT " + s2.constr.notnull.name + " ";
                                                        }

                                                        if (s2.constr.notnull.val == true) {
                                                            q += "NOT NULL ";
                                                        }
                                                        else {
                                                            q += "NULL ";
                                                        }

                                                        if (s2.constr.notnull.conflict != null) {
                                                            q += "ON CONFLICT " + s2.constr.notnull.conflict + " ";
                                                        }
                                                    }

                                                    if (s2.constr.check != null) {
                                                        if (s2.constr.check.name != null) {
                                                            q += "CONSTRAINT " + s2.constr.check.name + " ";
                                                        }
                                                        if (s2.constr.check.check != null) {
                                                            q += "CHECK ( " + s2.constr.check.check + " ) ";
                                                        }

                                                    }

                                                    if (s2.constr._default != null) {
                                                        if (s2.constr._default.name != null) {
                                                            q += "CONSTRAINT " + s2.constr._default.name + " ";
                                                        }
                                                        if (s2.constr._default._default != null) {
                                                            q += "DEFAULT " + s2.constr._default._default + " ";
                                                        }
                                                    }

                                                    if (s2.constr.generated != null) {
                                                        if (s2.constr.generated.name != null) {
                                                            q += "CONSTRAINT " + s2.constr.generated.name + " ";
                                                        }

                                                        if (s2.constr.generated.gen == true) {
                                                            q += "GENERATED ALWAYS AS ";
                                                        }
                                                        else {
                                                            q += "AS ";
                                                        }
                                                        if (s2.constr.generated.code != null) {
                                                            q += "( " + s2.constr.generated.code + " ) ";
                                                        }
                                                        else {
                                                            q += "() ";
                                                        }

                                                        if (s2.constr.generated.type != null) {
                                                            q += s2.constr.generated.type + " ";
                                                        }
                                                    }

                                                    if (s2.constr.collate != null) {
                                                        if (s2.constr.collate.name != null) {
                                                            q += "CONSTRAINT " + s2.constr.unique.name + " ";
                                                        }

                                                        if (s2.constr.collate.collate != null) {
                                                            q += "COLLATE " + s2.constr.collate.collate + " ";
                                                        }
                                                    }

                                                    if (s2.constr.pk != null) {
                                                        q += "PRIMARY KEY ";

                                                        if (s2.constr.pk.sortorder != null) {
                                                            q += s2.constr.pk.sortorder + " ";
                                                        }

                                                        if (s2.constr.pk.onconflict != null) {
                                                            q += "ON CONFLICT " + s2.constr.pk.onconflict + " ";
                                                        }

                                                        if (s2.constr.pk.autoincrement) {
                                                            q += "AUTOINCREMENT ";
                                                        }
                                                    }
                                                }

                                                if (k2 != s.cols.length - 1) {
                                                    q += ", \n";
                                                }
                                            }

                                            q += "\n); \n\n";
                                        }
                                        else {
                                            column(tb);
                                        }
                                    }
                                    else                 //:: Rename Table Column 
                                    {
                                        //console.log("Rename Table Columns ", "G6");

                                        var tb1 = s.name[0];
                                        column(tb1);
                                    }
                                }
                                function update() {
                                    //console.log(s.name.length.toString() , "G8");

                                    if (s.name.length == 2 && s.update == true) {
                                        var tb1 = s.name[0];
                                        var tb2 = s.name[1];

                                        var c1 = def.Where(i => i.name == tb1).length != 0;
                                        var c2 = def.Where(i => i.name == tb2).length == 0;

                                        if (c1 && c2) {
                                            var cos = def.Where(i => i.name == tb1)[0].cols;
                                            var qr = "PRAGMA foreign_keys = 0; \n\n";

                                            qr += "CREATE TABLE " + tb2 + " ( \n";
                                            //:cols 
                                            for (var k = 0; k < cos.length; k++) {
                                                var s1 = cos[k];
                                                qr += s1.name + " " + s1.type + " ";
                                                // constraints
                                                s1.constr.ForEach((s2) => {
                                                    if (s2["pk"] != null) {
                                                        var sc = s2["pk"];
                                                        if (sc != null) {
                                                            if (s2["name_1"] != null) {
                                                                var sn = s2["name_1"];
                                                                if (sn != null) {
                                                                    qr += "CONSTRAINT " + sn + " ";
                                                                }
                                                            }

                                                            qr += "PRIMARY KEY ";
                                                        }

                                                        sc = s2["sortorder"];
                                                        if (sc != null) {
                                                            qr += sc + " ";
                                                        }

                                                        sc = s2["p_conflict"];
                                                        if (sc != null) {
                                                            qr += "ON CONFLICT " + sc + " ";
                                                        }

                                                        sc = s2["autoincrement"];
                                                        if (sc != null) {
                                                            if (sc) {
                                                                qr += "AUTOINCREMENT ";
                                                            }
                                                        }
                                                    }
                                                    if (s2["collate"] != null) {
                                                        var sc;
                                                        if (s2["name_2"] != null) {
                                                            var sn = s2["name_2"];

                                                            if (sn != null) {
                                                                qr += "CONSTRAINT " + sn + " ";
                                                            }
                                                        }

                                                        sc = s2["collate"];
                                                        qr += "COLLATE " + sc + " ";
                                                    }
                                                    if (s2["code"] != null)              // Generated
                                                    {
                                                        var sc = s2["gen"];

                                                        if (sc != null) {
                                                            if (sc == true) {
                                                                if (s2["name_3"] != null) {
                                                                    var sn = s2["name_3"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }
                                                                qr += "GENERATED ALWAYS AS";
                                                            }
                                                            if (sc == false) {
                                                                if (s2["name_4"] != null) {
                                                                    var sn = s2["name_4"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }

                                                                qr += "AS ";
                                                            }

                                                        }

                                                        qr += "AS ";

                                                        sc = s2["code"];

                                                        if (sc != null) {
                                                            qr += "(" + sc + ") ";
                                                        }

                                                        sc = s2["type"];

                                                        if (sc != null) {
                                                            qr += sc + " ";
                                                        }
                                                    }
                                                    if (s2["default"] != null) {
                                                        if (s2["name_5"] != null) {
                                                            var sn = s2["name_5"];

                                                            if (sn != null) {
                                                                qr += "CONSTRAINT " + sn + " ";
                                                            }
                                                        }

                                                        var sc = s2["default"];
                                                        qr += "DEFAULT " + sc + " ";
                                                    }
                                                    if (s2["check"] != null) {
                                                        var sc = s2["check"];

                                                        if (sc != null) {
                                                            if (s2["name_6"] != null) {
                                                                var sn = s2["name_6"];

                                                                if (sn != null) {
                                                                    qr += "CONSTRAINT " + sn + " ";
                                                                }
                                                            }

                                                            qr += "CHECK (" + sc + ") ";
                                                        }
                                                    }
                                                    if (s2["notnull"] != null)              // Not Null 
                                                    {
                                                        var sc = s2["notnull"];

                                                        if (sc != null) {
                                                            if (sc == false) {
                                                                if (s2["name_7"] != null) {
                                                                    var sn = s2["name_7"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }
                                                                qr += "NOT NULL ";
                                                            }

                                                            if (sc == true) {
                                                                if (s2["name_8"] != null) {
                                                                    var sn = s2["name_8"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }
                                                                qr += "NULL ";
                                                            }
                                                        }

                                                        sc = s2["n_conflict"];

                                                        if (sc != null) {
                                                            qr += "ON CONFLICT " + sc + " ";
                                                        }
                                                    }
                                                    if (s2["unique"] != null)              // Unique  
                                                    {
                                                        var sc = s2["unique"];

                                                        if (sc == true) {
                                                            if (sc == true) {
                                                                if (s2["name_9"] != null) {
                                                                    var sn = s2["name_9"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }
                                                                qr += "NULL ";
                                                            }

                                                            qr += "UNIQUE ";
                                                        }

                                                        sc = s2["u_conflict"];

                                                        if (sc != null) {
                                                            qr += "ON CONFLICT " + sc + " ";
                                                        }
                                                    }
                                                    if ((s2["table"] != null) && (s2["col"] != null))              // Generated
                                                    {
                                                        var sc = s2["table"];
                                                        if (sc != null) {
                                                            if (sc == true) {
                                                                if (s2["name_10"] != null) {
                                                                    var sn = s2["name_10"];

                                                                    if (sn != null) {
                                                                        qr += "CONSTRAINT " + sn + " ";
                                                                    }
                                                                }

                                                                qr += "NULL ";
                                                            }
                                                            qr += "REFERENCES " + sc + " ";
                                                        }

                                                        sc = s2["col"];
                                                        if (sc != null) {
                                                            qr += "(" + sc + ") ";
                                                        }

                                                        sc = s2["onupdate"];
                                                        if (sc != null) {
                                                            qr += "ON UPDATE " + sc + " \n";
                                                        }

                                                        sc = s2["ondelete"];
                                                        if (sc != null) {
                                                            qr += "ON DELETE " + sc + " \n";
                                                        }

                                                        sc = s2["match"];
                                                        if (sc != null) {
                                                            qr += "MATCH " + sc + " ";
                                                        }

                                                        sc = s2["initially"];
                                                        if (sc != null) {
                                                            qr += sc + " ";
                                                        }

                                                        sc = s2["initially"];
                                                        if (sc != null) {
                                                            qr += sc + " ";
                                                        }

                                                        sc = s2["isdef"];
                                                        if (sc != null) {
                                                            qr += sc + " ";
                                                        }
                                                    }
                                                });
                                                // 
                                                if (k == cos.length - 1) {
                                                    qr += " , ";
                                                }
                                                qr += "\n";
                                            };
                                            //
                                            qr += "\n ); ";

                                            qr += "INSERT INTO " + tb2 + " (";
                                            //: cols 
                                            for (var k = 0; k < cos.length; k++) {
                                                var s1 = cos[k];
                                                qr += s1.name;
                                                if (k != cos.length - 1) {
                                                    qr += " , ";
                                                }
                                                qr += "\n";
                                            }
                                            //
                                            qr += ") \n";
                                            qr += "SELECT \n";
                                            //: cols 
                                            for (var k = 0; k < cos.length; k++) {
                                                var s1 = cos[k];
                                                qr += s1.name;
                                                if (k != cos.length - 1) {
                                                    qr += " , ";
                                                }
                                                qr += "\n";
                                            }
                                            //
                                            qr += "FROM " + tb1 + "; \n\n";
                                            qr += "DROP TABLE " + tb1 + "; \n\n";

                                            qr += "PRAGMA foreign_keys = 1; \n\n";

                                            console.log(qr, "Rename Table");

                                            var c = s.cols.Where(s2 => s2.name.length > 1).length == 0;
                                            if (!c) {
                                                column(tb1);
                                            }
                                        }
                                    }
                                    else if (s.name.length > 0) {
                                        create();
                                    }
                                    else {
                                        rn.push(JSON.stringify({
                                            error: "missing name of table",
                                            model: s
                                        }));
                                    }
                                }

                                if (s.name) {
                                    if (s.name.length == 1)  //: Create Table
                                    {
                                        //console.log("Create Table", "G1");
                                        create();
                                    }
                                    else                     //: Rename Table 
                                    {
                                        //console.log("Rename Table", "G2");
                                        update();
                                    }
                                }

                                var qy = q + "";

                                var qq = qy.indexOf(";") == -1 ? [qy] : qy.split(";").Where(i => i.trim() != "");

                                var er = [];
                                run(0, qq.length, qq);

                                var bk = 0;
                                function run(k, max, arr) {
                                    db.run(arr[k], (err) => {
                                        //console.log(JSON.stringify(err), "E13");
                                        if ((err + "").indexOf("SQLITE_BUSY") != -1) {
                                            if (bk < 120)
                                            {
                                                bk++;
                                                setTimeout(function () { run(k , max , arr); }, 500);
                                            }
                                            else
                                            {
                                                proc();
                                            }
                                        }
                                        else
                                        {
                                            proc();
                                        }

                                        function proc()
                                        {
                                            if (err) {
                                                er.push({ query: arr[k], response: err });
                                            }
                                            else {
                                                er.push({ query: arr[k], response: "200" });
                                            }

                                            //console.log("A", k + 1, max)
                                            if (k + 1 != max) {
                                                run(k + 1, max, arr);
                                            }
                                            else {
                                                rn.push(er);
                                                rt++;

                                                //console.log("B", rt, d1.tables.length);

                                                if (rt == d1.tables.length) {
                                                    resolve(JSON.stringify(rn));
                                                }
                                            }
                                        }
                                    })

                                }

                            });

                            if (d1.tables.length == 0) {
                                resolve("400: no tables defined");
                            }
                        }
                        //: 
                        trans(db1);
                    }
                    //: 
                    //: Create File
                    if (!fs.existsSync(p)) {
                        //: Create Path 
                        var r = "";
                        //console.log("None", "F1");
                        var q = p.substring(0, p.lastIndexOf("\\")).split("\\");
                        //console.log(JSON.stringify(q), "F2");

                        q.forEach((s, k) => {
                            if (k == 0) { r = s; }
                            else { r += "\\" + s; }

                            if (!fs.existsSync(r)) {
                                fs.mkdirSync(r);
                            }
                        });
                        //:
                        //: Download Content Database
                        //console.log("Download", "F3");

                        axios.get("http://localhost:" + port + "/assets/db/Database.db", { responseType: "arraybuffer" })
                            .then((r) => {
                                //console.log("False", "E6");
                                var d = Buffer.from(r.data);
                                fs.writeFile(p, d, function (err) {
                                    //console.log(err, "E7");
                                    if (err) {
                                        resolve("400:Error } " + err);
                                    }
                                    else {
                                        //resolve("Created file } " + p);
                                        conn();
                                    }
                                });

                            })
                            .catch((e) => {
                                //console.log("True", "E6");
                                reject(e);
                            });
                    }
                    else {
                        //console.log("None", "E8");
                        //resolve("Sqlite Database Found");
                        conn();
                    }
                    //:
                }
                else {
                    resolve(t + " functionality not found");
                }
            }

        });
    }
    //: exec sql queries 
    _exec(id, port, data, use, upath) {
        return new Promise((resolve, reject) => {
            var d1 = rd.api(id);

            if (d1) {
                var t = d1.type;

                if (t == "sqlite") {
                    var p = path.join(upath, d1.path);
                    //: Connect to Database
                    function conn() {
                        var db = new sqlite3.Database(p, (err) => {
                            if (err) {
                                resolve("400: " + err.message);
                            }
                            else {
                                exec(db);
                            }
                        })
                    }
                    function exec(db)
                    {
                        db.run("PRAGMA foreign_keys = ON", (err) => {
                            if (err) {
                                console.log("0" + err.message);
                            }
                        });

                        var qy = data.query;
                        //console.log(qy, " exec");

                        var qq = qy.indexOf(";") == -1 ? [qy] : qy.split(";").Where(i => i.trim() != "");

                        var er = [];

                        run(0, qq.length, qq);
                        var bk = 0;
                        function run(k, max, arr) {
                            db.all(arr[k], (err, rows) => {
                                //console.log(JSON.stringify(err), "E13");
                                if ((err + "").indexOf("SQLITE_BUSY") != -1) {
                                    if (bk < 120) {
                                        bk++;
                                        setTimeout(function () { run(k, max, arr); }, 500);
                                    }
                                    else {
                                        proc();
                                    }
                                }
                                else {
                                    proc();
                                }
                                function proc() {
                                    if (err) {
                                        er.push({ query: arr[k], response: err.message, error: true });
                                    }
                                    else {
                                        er.push({ query: arr[k], response: rows, error: false });
                                    }

                                    //console.log(k + 1, max)
                                    if (k + 1 != max) {
                                        run(k + 1, max, arr);
                                    }
                                    else { 
                                        if (qq.length == 1)   //: query 
                                        {
                                            var a = er.Where(i => i.error == true).length == 0;

                                            if (a) //: success
                                            {
                                                resolve(er[0].response);
                                            }
                                            else   //: error 
                                            {
                                                resolve("400:" + JSON.stringify(er[0].response));
                                            }
                                        }
                                        else                  //: transaction
                                        {
                                            var a = er.Where(i => i.error == true).length == 0;

                                            if (a)  //: success
                                            {
                                                if (use == "Delete" && false) //: TODO 
                                                {
                                                    db.run("VACUUM", (err) => {
                                                        if (err) {
                                                            console.log("0" + err.message);
                                                        }
                                                    });

                                                    resolve(er);
                                                }
                                                else {
                                                    resolve(er);
                                                }
                                            }
                                            else    //: error
                                            {
                                                resolve("400:" + JSON.stringify(er.Where(i => i.error == true)));
                                            }
                                        }
                                    }
                                }
                            })

                        }

                    }
                    //: 
                    if (fs.existsSync(p)) {
                        conn();
                    }
                    else {
                        resolve("400: database not found");
                    }
                }
                else {
                    resolve(t + " functionality not found");
                }
            }
        })
    }
    // AES 256 methods
    // Helpers
    createKey(password) {
        const keyBytes = 32;
        const salt = Buffer.from([80, 70, 60, 50, 40, 30, 20, 10]);
        const iterations = 300;

        return crypto.pbkdf2Sync(password, salt, iterations, keyBytes, 'sha256');
    }

    aesEncryptStringToBytes(plainText, key, iv) {
        if (!plainText || plainText.length <= 0) {
            throw new Error('plainText is null or empty');
        }
        if (!key || key.length <= 0) {
            throw new Error('key is null or empty');
        }
        if (!iv || iv.length <= 0) {
            throw new Error('iv is null or empty');
        }

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return Buffer.from(encrypted, 'base64');
    }

    aesDecryptStringToBytes(cipherText, key, iv) {
        if (!cipherText || cipherText.length <= 0) {
            throw new Error('cipherText is null or empty');
        }
        if (!key || key.length <= 0) {
            throw new Error('key is null or empty');
        }
        if (!iv || iv.length <= 0) {
            throw new Error('iv is null or empty');
        }

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(cipherText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    encrypt(data, _key) {
        var iv = crypto.scryptSync("encryption_iv", "GFG", 16);
        var key = this.createKey(_key);

        const encrypted = this.aesEncryptStringToBytes(data, key, iv);

        return encrypted.toString('base64');
    }

    decrypt(data, _key) {
        const iv = crypto.scryptSync("encryption_iv", "GFG", 16);
        var key = this.createKey(_key);

        var decrypted = this.aesDecryptStringToBytes(Buffer.from(data, 'base64'), key, iv);

        return decrypted;
    }
    //: user } each database  
    async register(data, id, port, upath, type) {
        var ts = this;
        var d = rd.api(id);
        var ret;

        if (d) {
            var df = d._default;
            var key = d.encrypt;

            var dt = true;

            d.access.forEach((s) => {
                if (s.type == type) {
                    var pn = df.cert_cols.Where(i => i.type == "type");

                    if (pn.length != 0) {
                        var dk = s.users.Where(i => i == data[pn[0].name]);

                        if (dk.length == 0) {
                            dt = false;
                            ret = "400: Not Authorized";
                        }
                    }
                    else {
                        dt = false;
                        ret = "400: type missing in default configuration";
                    }
                }
                else {
                    dt = false;
                    ret = "400: Not Authorized , unknown user";
                }
            });

            if (df && dt) {
                var cn = true;
                var pn = df.cert_cols.Where(i => i.register == true);

                pn.forEach((s) => {
                    if (!data[s.name]) { cn = false; ret = "400:" + s + " required"; }
                })

                if (cn) {
                    var qr = "INSERT INTO " + df.cert_name + " (";

                    var cols = d.tables.Where(i => i.name == df.cert_name)[0].cols.Select(i => i.name[0]);
                    var pt = pn;
                    cols.forEach((s) => {
                        var a = pt.Where(i => i.name == s);

                        if (a.length == 0 && data[s]) {
                            pn.push({ name: s })
                        }
                    });

                    pn.forEach((s, k) => {
                        qr += s.name + " ";

                        if (k + 1 != pn.length) {
                            qr += ",";
                        }
                    })

                    qr += `) 
`;
                    qr += " VALUES (";
                    pn.forEach((s, k) => {
                        var dp = data[s.name];
                        dp = (s.aes == true) ? ts.encrypt(dp, key) : dp;
                        qr += "\"" + dp + "\" ";

                        if (k + 1 != pn.length) {
                            qr += ",";
                        }
                    })

                    qr += `)`

                    console.log(qr);
                    try {

                        ret = await ts._exec(id, port, { query: qr }, "Create", upath);
                    }
                    catch (er) {
                        ret = er;
                    }
                }
            }
            else if (!df) {
                ret = "400:Database default not found";
            }
        }
        else {
            ret = "400:Database not found";
        }

        return ret;
    }
    async login(data, id, port, upath, _data) {
        var ts = this;
        var d = rd.api(id);
        var ret;

        if (d) {
            var df = d._default;
            var key = d.encrypt;

            if (df) {
                var cn = true;
                var pn = df.cert_cols.Where(i => i.login == true);
                var rq = df.cert_cols.Where(i => i.type == "type")[0].name;
                var ps = df.cert_cols.Where(i => i.session == true)[0].name;

                pn.forEach((s) => {
                    if (!data[s.name]) { cn = false; ret = "400:" + s + " required"; }
                })

                if (cn) {
                    var qr = `SELECT ` + rq + `
FROM ` + df.cert_name + `
WHERE `;
                    pn.forEach((s, k) => {
                        var dp = data[s.name];
                        dp = (s.aes == true) ? ts.encrypt(dp, key) : dp;
                        qr += s.name + " == \"" + dp + "\" ";

                        if (k + 1 != pn.length) {
                            qr += "AND ";
                        }
                    });

                    console.log(qr);
                    try {
                        var rt = await ts._exec(id, port, { query: qr }, "Read", upath);
                        console.log(rt);

                        if (Array.isArray(rt)) {
                            if (rt.length > 0) {
                                var type = rt[0][rq]; //console.log(type);

                                //
                                var a = (new Date());
                                var tm = a.getDay() + "/" + a.getMonth() + "/" + a.getFullYear() + " "
                                    + a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds();
                                //
                                var f = { email: data[ps], type: type, time: tm };

                                if (_data) {
                                    if (_data.dev_ip == "default" || _data.dev_ip == null) { f.ip = _data.def_ip; }
                                    else { f.ip = _data.dev_ip; }

                                    if (_data.dev_browser == "default" || _data.dev_ip == null) {
                                        f.browser = _data.def_browser;
                                    }
                                    else { f.browser = _data.dev_browser; }
                                }

                                console.log(f);

                                ret = ts.encrypt(JSON.stringify(f), key);
                            }
                            else {
                                ret = "400:1. User Not Found";
                            }
                        }
                        else {
                            ret = "400:2. User Not Found";
                        }
                    }
                    catch (er) {
                        ret = er;
                    }
                }
            }
            else {
                ret = "400:Database default not found";
            }
        }
        else {
            ret = "400:Database not found";
        }

        //console.log(ret);

        return ret;
    }
    logout(id) {
        var ts = this;
        var d = rd.api(id);
        var ret;

        var em = "";
        var tp = "";

        try {

            if (d._default) { if (d._default.email) { em = d._default.email; } }
            if (d._default) { if (d._default.type) { tp = d._default.type; } }
            //
            var a = (new Date());
            var tm = a.getDay() + "/" + a.getMonth() + "/" + a.getFullYear() + " "
                + a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds();
            //
            var f = { email: em, type: tp, time: tm };

            ret = ts.encrypt(JSON.stringify(f), k);
        }
        catch (e) {
            ret = "400:" + e;
        }

        return ret;
    }

    auth(user, id, upath) {
        var ts = this;
        var ret = {};

        var d1 = rd.api(id);

        if (d1 != null) {
            var t1 = d1.type;

            if (t1 == "sqlite") {
                var k = d1.encrypt;
                var u = user;

                if (user == "" || user == null) {
                    var em = "";
                    var tp = "";

                    if (d1._default != null) { if (d1._default.email != null) { em = d1._default.email; } }
                    if (d1._default != null) { if (d1._default.usertype != null) { tp = d1._default.usertype; } }

                    var f = { email: em, type: tp };

                    u = ts.encrypt(JSON.stringify(f), k);
                }

                try { ret = JSON.parse(ts.decrypt(u, k)); } catch { }

            }
        }

        return ret;
    }
    //: use case } all databases
    async sync(user, type, id, port, upath) {
        var ts = this;
        return new Promise((rs, rj) => {
            var d1 = rd.api(id); //console.log(id.toString() , "C1"); 
            var key = d1.encrypt;
            var _tabs = [];

            if (d1 != null) {
                if (d1.type == "sqlite") {
                    if (d1.usecase) {
                        var igs = ["Sync_Table"]; // d1._default.cert_name
                        var tabs = d1.usecase.Where(i => i.user == type && igs.indexOf(i.table) == -1)
                            .Select(i => i.table).Distinct();

                        var ret = [];
                        //console.log(type);
                        //console.log(d1.usecase);
                        //console.log(d1.usecase.Where(i => i.user == type));
                        //console.log(d1.usecase.Where(i => i.user == type)
                        //    .Select(i => i.table));
                        //console.log(tabs);

                        _tabs = tabs;

                        console.log("---: GET sync");
                        run(tabs, 0, tabs.length);

                        function run(tabs, k, max) {
                            console.log("---------------: " + k + " , " + max + ":-----------------");
                            if (k < max) {
                                var tab = tabs[k];


                                var qr = `
SELECT Idx
FROM Sync_Table
WHERE tName =="` + tab + `"  
`;
                                console.log(qr);
                                ts._exec(id, port, { query: qr }, "Read", upath).then((arr) => {
                                    var pc = emp(arr);
                                    console.log(arr);
                                    console.log(pc);

                                    if (pc) {
                                        qr = `
INSERT INTO Sync_Table (tName)
VALUES ("` + tab + `")
`;
                                        console.log(qr);
                                        ts._exec(id, port, { query: qr }, "Create", upath).then((arr) => {
                                            console.log(arr);

                                            nx();
                                        });
                                    }
                                    else {
                                        nx();
                                    }
                                });

                                function nx() {
                                    var qr = `
SELECT Idx
FROM Sync_Table
WHERE tName =="` + tab + `" AND Synced == "yes"
`;
                                    console.log(qr);
                                    ts._exec(id, port, { query: qr }, "Read", upath).then((arr) => {
                                        var pc = emp(arr);
                                        console.log(arr);
                                        console.log(pc);

                                        if (pc) {
                                            // Start Sync
                                            var tb = d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                .cols.Select(i => i.name[0]);

                                            var qr = `SELECT `;

                                            tb.forEach((s, k) => {
                                                qr += s;

                                                if (k + 1 != tb.length) {
                                                    qr += " , ";
                                                }
                                            });
                                            qr += `
FROM ` + tab;

                                            console.log(qr);

                                            var url = d1.ip + "/SqlGet2?"
                                                + "query=" + btoa(unescape(encodeURIComponent(qr))) + "&"
                                                + "user=" + user + "&"
                                                + "auth=" + JSON.stringify([{ use: "Read", tab: tab }]) + "&"
                                                + "k=" + "1" + "&"
                                                + "max=" + "1" + "&"
                                                + "id=" + id;

                                            console.log(url);

                                            fetch(url).then((r) => {

                                                if (r.status == 200) {
                                                    r.text().then((t) => {
                                                        console.log(t);
                                                        console.log(typeof (t));

                                                        if (t.indexOf("400:") == 0) {
                                                            er(t.replace("400:", ""));
                                                        }
                                                        else {
                                                            var s = [];
                                                            try { s = JSON.parse(t); } catch { }

                                                            sc(s);
                                                        }
                                                    })
                                                }
                                                else {
                                                    console.log("failed");
                                                    er(r.statusText);
                                                }

                                                function sc(dr) {
                                                    var pc = emp(dr);
                                                    console.log(dr);
                                                    console.log(pc);
                                                    //:
                                                    if (pc) {
                                                        ret.push({ table: tab, response: "empty", error: false });
                                                        qr = `
UPDATE Sync_Table
SET Synced = "yes"   
WHERE tName == "` + tab + `"`;
                                                        console.log(qr);

                                                        ts._exec(id, port, { query: qr }, "Update", upath).then((rr) => {
                                                            console.log(rr);
                                                            run(tabs, k + 1, max);
                                                        });
                                                    }
                                                    else {
                                                        run2(dr, 0, dr.length);
                                                    }
                                                    function run2(dr, k2, max2) {
                                                        if (k2 < max2) {
                                                            var d = dr[k2];

                                                            var qr = ` INSERT INTO ` + tab + " (";
                                                            tb.forEach((s, k) => {
                                                                qr += s;

                                                                if (k + 1 != tb.length) {
                                                                    qr += " , ";
                                                                }
                                                            });
                                                            qr += ` ) 
VALUES(`;
                                                            tb.forEach((s, k) => {
                                                                qr += "\"" + d[s] + "\"";

                                                                if (k + 1 != tb.length) {
                                                                    qr += " , ";
                                                                }
                                                            });
                                                            qr += ` )`;

                                                            ts._exec(id, port, { query: qr }, "Read", upath).then((rr) => {
                                                                console.log(qr);
                                                                console.log(rr);
                                                                run2(dr, k2 + 1, max2);
                                                            })
                                                        }
                                                        else {
                                                            ret.push({ table: tab, response: "200", error: false });

                                                            qr = `
UPDATE Sync_Table
SET Synced = "yes"   
WHERE tName == "` + tab + `"`;
                                                            console.log(qr);

                                                            ts._exec(id, port, { query: qr }, "Update", upath).then((rr) => {
                                                                console.log(rr);
                                                                run(tabs, k + 1, max);
                                                            });

                                                        }
                                                    }
                                                    //:
                                                }
                                                function er(e) {
                                                    console.log(e)
                                                    ret.push({ table: tab, response: e, error: true });
                                                    run(tabs, k + 1, max);
                                                }

                                            }, (e) => {
                                                console.log("failed 2");
                                                run(tabs, k + 0, max);
                                            });

                                            //
                                        }
                                        else {
                                            run(tabs, k + 1, max);
                                        }
                                    });
                                }
                            }
                            else {
                                nx1(ret);
                            }
                        }
                    }
                    else {
                        rs("400: usecases missing");
                    }
                }
                else {
                    rs("400: database is a non-cache");
                }
            }
            else {
                rs("400: database not found");
            }

            function emp(arr) {
                var pc = false;
                try {
                    if (typeof (arr) == "string") {
                        if (arr.indexOf("400:") != 0) {
                            var a = JSON.parse(arr.replace("400:", ""));
                            pc = a.length == 0;
                        }
                    }
                    else if (typeof (arr) == "object") {
                        if (Array.isArray(arr)) {
                            pc = arr.length == 0;
                        }
                    }
                }
                catch {

                }

                return pc;
            }
            function nx1(pvs) {
                var tvs = [];

                var us = user;
                var cn = true;
                try {
                    //console.log(us);
                    us = ts.decrypt(us, key);
                    //console.log(us);
                    us = JSON.parse(us);
                    //console.log(us);

                    if (us.email != null && us.ip != null && us.browser != null) { }
                    else {
                        //console.log(us);
                        cn = false;
                    }
                }
                catch {
                    cn = false;
                }

                console.log("---: TCP sync");

                if (cn) {
                    var qr = `
SELECT "Idx" , "tName" , "rId" , "Room"
FROM Offline_Table
WHERE LogType == "SQL" AND ID IN (
   SELECT "Idx"
   FROM Soap_Users
   WHERE Email == "` + us["email"] +
                        `" AND Remote == "` + id +
                        `" AND DeviceID == "` + us["ip"] +
                        `" AND BrowserName == "` + btoa(unescape(encodeURIComponent(us["browser"]))) + `"
)`;

                    //console.log(qr);

                    nx1({
                        qr: qr,
                        tab: "Offline_Table",
                        act: "Read",
                        success: function (dr) {
                            if (Array.isArray(dr)) {
                                run(dr, 0, dr.length);
                            }
                            else {
                                nxf2(pvs, tvs);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                            nxf2(pvs, tvs);
                        }
                    })

                    function run(msgs, k, max) {
                        if (k < max) {
                            var msg = msgs[k];
                            //console.log(msg);

                            if (msg.Room == "Delete") {
                                qr = `DELETE FROM ` + msg.tName + `
WHERE Idx == ` + msg.rId;

                                console.log(qr);

                                ts._exec(id, port, { query: qr }, "Delete", upath).then((r) => {
                                    console.log(r);
                                    nx();
                                });
                            }
                            else {
                                mds().then((qr) => {
                                    if (qr) {
                                        console.log(qr);
                                        ts._exec(id, port, { query: qr }, msg.Room, upath).then((r) => {
                                            console.log(r);
                                            nx();
                                        });
                                    }
                                    else {
                                        nx();
                                    }
                                })
                            }

                            function mds() {
                                return new Promise((rs2, rj2) => {
                                    var tb = d1.tables.Where(i => i.name.indexOf(msg.tName) != -1)[0]
                                        .cols.Select(i => i.name[0]);

                                    var q1 = "";
                                    tb.forEach((s, k) => {
                                        q1 += `"` + s + `"`;

                                        if (k + 1 != tb.length) {
                                            q1 += " , ";
                                        }
                                    });

                                    var qr = `
SELECT ` + q1 + `
FROM ` + msg.tName + `
WHERE Idx == ` + msg.rId;
                                    //console.log(qr);

                                    ts._exec(id, port, { query: qr }, "Read", upath).then((ar3) => {
                                        //console.log(ar3);

                                        if (ar3.length != 0) {

                                            var r = ar3[0];
                                            //console.log(r);

                                            if (msg.Room == "Create") {
                                                var qr = `INSERT INTO ` + msg.tName;
                                                var q1 = "";
                                                var q2 = "";

                                                tb.forEach((s, k) => {
                                                    q1 += s;

                                                    var type = d1.tables.Where(i => i.name.indexOf(msg.tName) != -1)[0]
                                                        .cols.Where(i => i.name[0] == s)[0].type;

                                                    if (type == "TEXT") {
                                                        q2 += `"` + r[s] + `"`;
                                                    }
                                                    else {
                                                        q2 += r[s];
                                                    }

                                                    if (k + 1 != tb.length) {
                                                        q1 += " , ";
                                                        q2 += " , ";
                                                    }
                                                });
                                                qr = qr + ` ( ` + q1 + ` )
VALUES ( ` + q2 + ` ) `;
                                                //console.log(qr);

                                                rs2(qr);
                                            }
                                            if (msg.Room == "Update") {
                                                var qr = `UPDATE ` + msg.tName + `
SET `;
                                                var q1 = "";
                                                var q2 = "";

                                                var tb2 = tb.Where(i => i != "Idx");
                                                tb2.forEach((s, k) => {
                                                    var type = d1.tables.Where(i => i.name.indexOf(msg.tName) != -1)[0]
                                                        .cols.Where(i => i.name[0] == s)[0].type;

                                                    if (type == "TEXT") {
                                                        q2 += s + ` = "` + r[s] + `"`;
                                                    }
                                                    else {
                                                        q2 += s + " = " + r[s];
                                                    }

                                                    if (k + 1 != tb2.length) {
                                                        q2 += " , ";
                                                    }
                                                });
                                                qr = qr + q2 + `
Where Idx = ` + r.Idx;
                                                //console.log(qr);

                                                rs2(qr);
                                            }
                                        }
                                        else {
                                            rs2(null);
                                        }

                                    });
                                });
                            }

                            function nx() {
                                qr = `DELETE FROM Offline_Table
WHERE Idx == ` + msg.Idx;

                                console.log();
                                console.log(qr);
                                console.log();

                                nx1({
                                    qr: qr,
                                    tab: "Offline_Table",
                                    act: "Delete",
                                    success: function (dr) {
                                        console.log(dr);
                                        run(msgs, k + 1, max);
                                    },
                                    error: function (e) {
                                        console.log(e);
                                        run(msgs, k + 1, max);
                                    }
                                })
                            }
                        }
                        else {
                            nxf2(pvs, tvs);
                        }
                    }

                    function nx1(obj) {
                        var url = d1.ip + "/SqlGet2?"
                            + "query=" + btoa(unescape(encodeURIComponent(obj.qr))) + "&"
                            + "user=" + user + "&"
                            + "auth=" + JSON.stringify([{ use: obj.act, tab: obj.tab }]) + "&"
                            + "k=" + "1" + "&"
                            + "max=" + "1" + "&"
                            + "id=" + id;

                        //console.log(url);

                        fetch(url).then((r) => {

                            if (r.status == 200) {
                                r.text().then((t) => {
                                    //console.log(t);
                                    //console.log(typeof (t));

                                    if (t.indexOf("400:") == 0) {
                                        er(t.replace("400:", ""));
                                    }
                                    else {
                                        var s = [];
                                        try { s = JSON.parse(t); } catch { }

                                        sc(s);
                                    }
                                })
                            }
                            else {
                                console.log("failed");
                                er(r.statusText);
                            }

                            function sc(dr) {
                                tvs.push({ table: obj.tab, response: dr, error: false });
                                obj.success(dr);
                            }
                            function er(e) {
                                tvs.push({ table: obj.tab, response: e, error: true });
                                obj.error(e);
                            }

                        }, (e) => {
                            console.log("failed 2");
                            tvs.push({ table: obj.tab, response: e, error: true });
                            obj.error(e);
                        });
                    }
                }
                else {
                    nxf2(pvs, tvs);
                }
            }
            function nxf2(pvs, tvs) {
                var pss = [];
                var ret = [pvs, tvs];
                var tabs = _tabs;

                console.log("---: POST sync");
                run(tabs, 0, tabs.length);

                function run(tabs, k, max) {
                    console.log("---------------: " + k + " , " + max + ":-----------------");
                    if (k < max) {
                        var tab = tabs[k];
                        var qr = `
SELECT Idx
FROM Sync_Table
WHERE tName =="` + tab + `" AND TCP == "no"
`;
                        console.log(qr);
                        ts._exec(id, port, { query: qr }, "Read", upath).then((arr) => {
                            var pc = emp(arr);
                            console.log(arr);
                            console.log(pc);

                            if (pc == false) {
                                // Start Sync
                                var qr = `
SELECT Idx , rId , rAct , rRoom
FROM Schedule_Table
WHERE tName =="` + tab + `"
`;
                                console.log(qr);
                                ts._exec(id, port, { query: qr }, "Read", upath).then((ar2) => {
                                    var pc = emp(ar2);
                                    console.log(ar2);
                                    console.log(pc);

                                    if (pc == false) {
                                        run2(ar2, 0, ar2.length);
                                        function run2(ar2, k2, max2) {
                                            if (k2 < max2) {
                                                var ob = ar2[k2];

                                                console.log(ob);

                                                if (ob.rAct == "Create") {
                                                    mds().then((qr) => {
                                                        console.log(qr);
                                                        nx3({
                                                            qr: qr,
                                                            act: ob.rAct,
                                                            room: ob.rRoom,
                                                            success: (r) => {
                                                                console.log(r);
                                                                nx2();
                                                            },
                                                            error: (e) => {
                                                                console.log(e);
                                                                nx2();
                                                            }
                                                        });
                                                    });

                                                }
                                                else if (ob.rAct == "Update") {
                                                    mds().then((qr) => {
                                                        console.log(qr);
                                                        nx3({
                                                            qr: qr,
                                                            act: ob.rAct,
                                                            room: ob.rRoom,
                                                            success: (r) => {
                                                                console.log(r);
                                                                nx2();
                                                            },
                                                            error: (e) => {
                                                                console.log(e);
                                                                nx2();
                                                            }
                                                        });
                                                    });
                                                }
                                                else if (ob.rAct == "Delete") {
                                                    var qr = `
DELETE FROM ` + tab + `
Where Idx == ` + ob.rId;
                                                    console.log(qr);
                                                    nx3({
                                                        qr: qr,
                                                        act: ob.rAct,
                                                        room: ob.rRoom,
                                                        success: (r) => {
                                                            console.log(r);
                                                            nx2();
                                                        },
                                                        error: (e) => {
                                                            console.log(e);
                                                            nx2();
                                                        }
                                                    });
                                                }
                                                else {
                                                    nx2();
                                                }

                                                function nx3(obj) {
                                                    var url = d1.ip + "/SqlGet2?"
                                                        + "query=" + btoa(unescape(encodeURIComponent(obj.qr))) + "&"
                                                        + "room=" + obj.room + "&"
                                                        + "user=" + user + "&"
                                                        + "auth=" + JSON.stringify([{ use: obj.act, tab: tab }]) + "&"
                                                        + "k=" + "1" + "&"
                                                        + "max=" + "1" + "&"
                                                        + "id=" + id;

                                                    console.log(url);

                                                    fetch(url).then((r) => {

                                                        if (r.status == 200) {
                                                            r.text().then((t) => {
                                                                console.log(t);
                                                                console.log(typeof (t));

                                                                if (t.indexOf("400:") == 0) {
                                                                    er(t.replace("400:", ""));
                                                                }
                                                                else {
                                                                    var s = [];
                                                                    try { s = JSON.parse(t); } catch { }

                                                                    sc(s);
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            console.log("failed");
                                                            er(r.statusText);
                                                        }

                                                        function sc(dr) {
                                                            pss.push({ table: tab, response: dr, error: false });
                                                            obj.success(dr);
                                                        }
                                                        function er(e) {
                                                            pss.push({ table: tab, response: e, error: true });
                                                            obj.error(e);
                                                        }

                                                    }, (e) => {
                                                        console.log("failed 2");
                                                        run(tabs, k + 0, max);
                                                    });
                                                }

                                                function nx2() {
                                                    var qr = `
DELETE FROM Schedule_Table
WHERE Idx == "` + ob.Idx + `"`;
                                                    //console.log(qr);

                                                    ts._exec(id, port, { query: qr }, "Delete", upath).then((r) => {
                                                        console.log(r);
                                                        run2(ar2, k2 + 1, max2);
                                                    });
                                                }

                                                function mds() {
                                                    return new Promise((rs2, rj2) => {
                                                        var tb = d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                            .cols.Select(i => i.name[0]);

                                                        var q1 = "";
                                                        tb.forEach((s, k) => {
                                                            q1 += `"` + s + `"`;

                                                            if (k + 1 != tb.length) {
                                                                q1 += " , ";
                                                            }
                                                        });

                                                        var qr = `
SELECT ` + q1 + `
FROM ` + tab + `
WHERE Idx == ` + ob.rId;
                                                        //console.log(qr);

                                                        ts._exec(id, port, { query: qr }, "Read", upath).then((ar3) => {
                                                            //console.log(ar3);

                                                            if (ar3.length != 0) {

                                                                var r = ar3[0];
                                                                //console.log(r);

                                                                if (ob.rAct == "Create") {
                                                                    var qr = `INSERT INTO ` + tab;
                                                                    var q1 = "";
                                                                    var q2 = "";

                                                                    tb.forEach((s, k) => {
                                                                        q1 += s;

                                                                        var type = d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                                            .cols.Where(i => i.name[0] == s)[0].type;

                                                                        //console.log(s);
                                                                        //console.log(d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                                        //    .cols.Where(i => i.name[0] == s));
                                                                        //console.log(type);

                                                                        if (type == "TEXT") {
                                                                            q2 += `"` + r[s] + `"`;
                                                                        }
                                                                        else {
                                                                            q2 += r[s];
                                                                        }

                                                                        if (k + 1 != tb.length) {
                                                                            q1 += " , ";
                                                                            q2 += " , ";
                                                                        }
                                                                    });
                                                                    qr = qr + ` ( ` + q1 + ` )
VALUES ( ` + q2 + ` ) `;
                                                                    //console.log(qr);

                                                                    rs2(qr);
                                                                }
                                                                if (ob.rAct == "Update") {
                                                                    var qr = `UPDATE ` + tab + `
SET `;
                                                                    var q1 = "";
                                                                    var q2 = "";

                                                                    var tb2 = tb.Where(i => i != "Idx");
                                                                    tb2.forEach((s, k) => {
                                                                        var type = d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                                            .cols.Where(i => i.name[0] == s)[0].type;

                                                                        //console.log(s);
                                                                        //console.log(d1.tables.Where(i => i.name.indexOf(tab) != -1)[0]
                                                                        //    .cols.Where(i => i.name[0] == s));
                                                                        //console.log(type);

                                                                        if (type == "TEXT") {
                                                                            q2 += s + ` = "` + r[s] + `"`;
                                                                        }
                                                                        else {
                                                                            q2 += s + " = " + r[s];
                                                                        }

                                                                        if (k + 1 != tb2.length) {
                                                                            q2 += " , ";
                                                                        }
                                                                    });
                                                                    qr = qr + q2 + `
Where Idx = ` + r.Idx;
                                                                    //console.log(qr);

                                                                    rs2(qr);
                                                                }
                                                            }
                                                            else {
                                                                console.log("item already removed");
                                                                nx2();
                                                            }

                                                        });
                                                    });
                                                }
                                            }
                                            else {
                                                console.log("A");
                                                run(tabs, k + 1, max);
                                            }
                                        }
                                    }
                                    else {
                                        run(tabs, k + 1, max);
                                    }
                                });
                                //
                            }
                            else {
                                run(tabs, k + 1, max);
                            }
                        });
                    }
                    else {
                        ret.push(pss);
                        rs(ret);
                    }
                }

            }
        });
    }
    async sync_case(tab, user, id, port, upath) {
        var ts = this;
        return new Promise((rs, rj) => {
            var d1 = rd.api(id); //console.log(id.toString() , "C1");

            if (d1 != null) {
                var u = d1.usecase; //console.log(JSON.stringify(u), "C2");
                //console.log(use , "C3");
                //console.log(user , "C4");

                if (u != null) {
                    if (d1.type == "sqlite") {
                        //console.log(tab , "C5");
                        var f1 = u.Where(i => i.table == tab &&
                            ((i.user == user && user != null) || i.user == "*")

                        ).length != 0;

                        if (f1) {
                            var qr = `
    SELECT Idx
    FROM Sync_Table
    WHERE tName == "` + tab + `" AND Synced == "yes"
    `;
                            ts._exec(id, port, { query: qr }, "Read", upath).then((arr) => {
                                console.log(qr);
                                console.log(arr.length, arr.length != 0 ? " is Synced " : " is not Synced");

                                rs(arr.length != 0);
                            });
                        }
                        else {
                            rs(false);
                        }
                    }
                    else {
                        rs(true);
                    }
                }
                else {
                    rs(false);
                }
            }
            else {
                return false;
            }
        });
    }
    usecase(tab, use, user, id, upath) {
        var d1 = rd.api(id); //console.log(id.toString() , "C1");

        if (d1 != null) {
            var u = d1.usecase; //console.log(JSON.stringify(u), "C2");
            //console.log(use , "C3");
            //console.log(user , "C4");

            if (u != null) {
                //console.log(tab , "C5");
                var f1 = u.Where(i => i.table == tab).length == 0; //console.log(f1.toString(), "C6");

                var f2 = u.Where(i => i.table == tab &&
                    i.use == use &&
                    ((i.user == user && user != null) || i.user == "*")

                ).length != 0;                                   //console.log(f2.toString(), "C7");

                return f1 || f2;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }

    }
    onresponse(data) {
        return new Promise((resolve, reject) => {
            resolve(data);
        })
    }
    onrequest(id, port, data, ds, tab, upath) {
        return new Promise((resolve, reject) => {
            resolve(data);
        })
    }
    //: sync 
    onsync(data, id) {
        return new Promise((resolve, reject) => {
            var d = rd.api(id);

            if (d) {
                var t = d.type;

                if (t == "sqlite") {
                    var url = d.api;

                    if (url) {
                        axios.get(url)
                            .then((r) => {

                                if (typeof (r) == "string") {
                                    if (r.trim().indexOf("400:") != 0) {
                                        resolve(data);
                                    }
                                    else {
                                        reject(r);
                                    }
                                }
                                else {
                                    resolve(data);
                                }

                            })
                            .catch((e) => {
                                var er = ((e + "").trim().indexOf("400:") == -1) ? "400:" + e : e;

                                reject(er);
                            });
                    }
                    else {
                        resolve(data);
                    }
                }
                else {
                    resolve(data);
                }

            }
            else {
                resolve(data);
            }
        }) 
    }
    //: secure
    on_aes(data) {
        var ts = this;
        var ret = data;

        var d = rd.api(id);

        if (d) {
            var key = d.encrypt;
            if (key) {
                if (data.indexOf("AES_256(")) {
                    var r = new RegExp('AES\s*\([^\)]+\)', 'g');

                    var arr = [];
                    var sr = -1;
                    while (match = r.exec(data) != null) {
                        var s = match.index;
                        var e = match[0].length + s + 1;

                        if (sr == -1) {
                            sr = e;
                        }
                        else {
                            arr.push([sr + 1, s]);
                            sr = e;
                        }

                        arr.push([s, e]);
                    }

                    var st = [];


                    arr.forEach((s, k) => {
                        if (k == 0 && s[0] != 0) {
                            st.push(data.substring(0, s[0]));
                        }

                        var ds = data.substring(s[0], s[1]);
                        // encrypt
                        if (ds.indexOf("ES_2565") != -1) {
                            ds = ds.substring(ds.indexOf("(") + 1, ds.lastIndexOf(")")).trim();
                            ds = ts.encrypt(ds, key);
                        }
                        //
                        st.push(ds);

                        if (k + 1 == arr.length) {
                            st.push(data.substring(s[1], data.length));
                        }

                    })

                    var dd = "";

                    st.forEach((s) => { dd += s; })

                    ret = dd;
                }
            }
        }

        return ret;
    }
    //: profile
    async signin_profile(id, port, _data, upath) {
        var ts = this;
        var ret = "";
        var ps = rd.get_developer();

        if (ps == _data.password && ps != "developer@password") {
            var ac = rd.get_actors();

            var d = rd.api(id);
            var df = d._default;

            var data = ac.Where(i => i.email == _data.profile);
            if (data.length != 0) {
                await nex(data[0]);
            }
            else {
                var fn = false;
                for (var ss of ac) {
                    data = ss.others.Where(i => i.email == _data.profile);
                    if (data.length != 0 && !fn) {
                        fn = true;
                        await nex(data[0]);
                    }
                }


                if (!fn) {
                    ret = "400: profile not found";
                }
            }

            async function nex(data) {
                var cn = true;
                var pn = df.cert_cols.Where(i => i.login == true);

                var dt = {};

                pn.forEach((s) => {
                    if (!data[s.name.toLowerCase()]) { cn = false; ret = "400: profile " + s.name + " not found"; }

                    dt[s.name] = data[s.name.toLowerCase()];
                })

                if (cn) {
                    console.log(_data);
                    ret = await ts.login(dt, id, port, upath, _data);
                }
            }
        }
        else {
            ret = "400: incorrect password";
        }

        return ret;
    }
    async init_profile(id, port, password, upath) {
        var ts = this;
        var ret = "";
        var ps = rd.get_developer();

        if (ps == password && ps != "developer@password") {
            var ac = rd.get_actors();

            var d = rd.api(id);
            var df = d._default;
            var key = d.encrypt;

            var uc = df.cert_cols.Where(i => i.type == "type" && i.register == true);
            var em = df.cert_cols.Where(i => i.type == "email" && i.register == true);
            var pw = df.cert_cols.Where(i => i.aes == true && i.register == true);

            if (uc.length != 0 && em.length != 0 && pw.length != 0) {
                var tb = d.tables.Where(i => i.name.indexOf(df.cert_name) != -1);

                if (tb.length != 0) {

                    var cs = tb[0].cols.Where(i => i.name.indexOf(uc[0].name) == -1 &&
                        i.name.indexOf(em[0].name) == -1 &&
                        i.name.indexOf(pw[0].name) == -1 &&
                        i.name.length != 0 &&
                        (i.constr &&
                            i.constr.notnull &&
                            i.constr.notnull.val == true
                        ) &&
                        !(i.constr &&
                            i.constr.pk &&
                            i.constr.pk.autoincrement == true
                        )

                    ).Select(i => i.name[0]);

                    console.log(cs);

                    var qr = "";
                    for (var s of ac) {
                        var rc = s.others;
                        rc.push({
                            email: s.email,
                            password: s.password
                        });

                        for (var s2 of rc) {
                            if (s2[em[0].name.toLowerCase()] != null && s2[pw[0].name.toLowerCase()] != null) {
                                var a = "INSERT INTO " + df.cert_name + " (\"" + em[0].name + "\" , \"" + pw[0].name + "\" , \"" + uc[0].name;
                                //
                                cs.forEach((s3) => {
                                    a += "\" , \"" + s3;
                                })
                                //
                                a += `\") 
VALUES( "` + s2[em[0].name.toLowerCase()] + "\" , \"" + ts.encrypt(s2[pw[0].name.toLowerCase()], key) + "\" , \"" + s["user"];

                                //
                                cs.forEach((s3) => {
                                    var b = (s3.toLowerCase().indexOf("name") != -1) ? s3 : s3.length;
                                    if (s2[s3.toLowerCase()] != null) {
                                        b = s2[s3.toLowerCase()];
                                    }

                                    a += "\" , \"" + b;
                                })
                                //
                                a += `\" );
`;

                                qr += a;
                            }
                        }
                    }

                    //console.log(qr);
                    try {

                        ret = await ts._exec(id, port, { query: qr }, "Create", upath);
                    }
                    catch (er) {
                        ret = er;
                    }
                }
                else {
                    ret = "400:" + df.cert_name + " not found in database " + id + " tables";
                }

            }
        }
        else {
            ret = "400: incorrect password";
        }

        return ret;
    }
    //:
}

module.exports = { Api }


