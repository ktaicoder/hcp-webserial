'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');

function arrayIndexOf(src, needle) {
    var needleLen = needle.length;
    if (src.length < needleLen)
        return -1;
    for (var i = 0; i < src.length - needleLen + 1; i++) {
        var found = true;
        for (var k = 0; k < needle.length; k++) {
            if (src[i + k] !== needle[k]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i;
        }
    }
    return -1;
}
function arrayConcat(arr1, arr2) {
    var result = new Uint8Array(arr1.length + arr2.length);
    result.set(arr1);
    result.set(arr2, arr1.length);
    return result;
}

var DelimiterParser = /** @class */ (function () {
    function DelimiterParser(opts) {
        var _this = this;
        this.enqueue = function (chunk, callback) {
            var data = arrayConcat(_this.buffer, chunk);
            var pos;
            while ((pos = arrayIndexOf(data, _this.delimiter)) !== -1) {
                var pktLen = pos + (_this.includeDelimiter ? _this.delimiter.length : 0);
                callback(data.slice(0, pktLen));
                data = data.slice(pos + _this.delimiter.length);
            }
            // TODO 최대 버퍼링 길이보다 크면 버리는게 좋겠다
            _this.buffer = data;
        };
        this.delimiter = opts.delimiter;
        this.includeDelimiter = opts.includeDelimiter === true;
        this.buffer = new Uint8Array(0);
    }
    DelimiterParser.parse = function (opts) {
        var parser = new DelimiterParser(opts);
        return function (upstream) {
            return new rxjs.Observable(function (subscriber) {
                var subscription = upstream.subscribe({
                    next: function (chunk) {
                        if (!subscriber.closed) {
                            parser.enqueue(chunk, function (parsedChunk) {
                                if (!subscriber.closed && parsedChunk.length > 0) {
                                    subscriber.next(parsedChunk);
                                }
                            });
                        }
                    },
                    error: subscriber.error,
                    complete: subscriber.complete
                });
                return function () {
                    subscription.unsubscribe();
                };
            });
        };
    };
    return DelimiterParser;
}());

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var WebSerialDevice = /** @class */ (function () {
    function WebSerialDevice() {
        var _this = this;
        this.deviceState$ = new rxjs.BehaviorSubject("closed");
        this.receivedData$ = new rxjs.Subject();
        /**
         * implement IDevice
         */
        this.observeDeviceState = function () { return _this.deviceState$.asObservable(); };
        /**
         * implement IDevice
         */
        this.waitUntilOpened = function (timeoutMilli) {
            if (timeoutMilli === void 0) { timeoutMilli = 0; }
            if (timeoutMilli > 0) {
                return rxjs.firstValueFrom(_this.deviceState$.pipe(rxjs.filter(function (it) { return it === "opened"; }), rxjs.take(1), rxjs.timeout({ first: timeoutMilli }), rxjs.map(function () { return true; })));
            }
            else {
                return rxjs.firstValueFrom(_this.deviceState$.pipe(rxjs.filter(function (it) { return it === "opened"; }), rxjs.take(1), rxjs.map(function () { return true; })));
            }
        };
        /**
         * implement IDevice
         */
        this.observeReceivedData = function () {
            return _this.deviceState$.pipe(rxjs.switchMap(function (state) { return (state === "opened" ? _this.receivedData$.asObservable() : rxjs.EMPTY); }));
        };
        /**
         * 연결 여부
         * implement IDevice
         */
        this.isOpened = function () {
            return _this.deviceState$.value === "opened";
        };
        /**
         * 디바이스 열기
         * implement IDevice
         */
        this.open = function (port, options) { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("WebSerialDevice.open", options);
                        this.deviceState$.next("opening");
                        if (!!port.readable) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, port.open(options)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [3 /*break*/, 4];
                    case 4:
                        if (!port.readable) {
                            this.deviceState$.next("closed");
                            return [2 /*return*/];
                        }
                        this.onOpened_(port);
                        return [2 /*return*/];
                }
            });
        }); };
        this.onOpened_ = function (port) {
            _this.port_ = port;
            _this.deviceState$.next("opened");
            _this.readLoopPromise_ = _this.startReadLoop_();
        };
        this.startReadLoop_ = function () { return __awaiter(_this, void 0, void 0, function () {
            var reader, _a, dataBuffer, done, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.deviceState$.value === "opened")) return [3 /*break*/, 10];
                        if (!(!this.port_ || !this.port_.readable)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        console.log("SerialPortManager.startReadLoop_");
                        reader = this.port_.readable.getReader();
                        this.reader_ = reader;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, 8, 9]);
                        _b.label = 4;
                    case 4:
                        if (!(this.deviceState$.value === "opened")) return [3 /*break*/, 6];
                        return [4 /*yield*/, reader.read()];
                    case 5:
                        _a = _b.sent(), dataBuffer = _a.value, done = _a.done;
                        if (done) {
                            return [3 /*break*/, 6];
                        }
                        if (dataBuffer) {
                            this.receivedData$.next({ timestamp: Date.now(), dataBuffer: dataBuffer });
                        }
                        return [3 /*break*/, 4];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        err_2 = _b.sent();
                        // Handle non-fatal
                        console.info("ignore error", err_2);
                        return [3 /*break*/, 9];
                    case 8:
                        reader.releaseLock();
                        this.reader_ = undefined;
                        return [7 /*endfinally*/];
                    case 9: return [3 /*break*/, 0];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        /**
         * write to serial port
         * @param value data to send
         * @returns Promise<void>
         *
         * implement IDevice
         */
        this.write = function (value) { return __awaiter(_this, void 0, void 0, function () {
            var port, writer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        port = this.port_;
                        if (!port || !port.writable) {
                            console.log("port is not opened");
                            return [2 /*return*/];
                        }
                        if (port.writable.locked) {
                            console.log("port is locked");
                            return [2 /*return*/];
                        }
                        writer = port.writable.getWriter();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        this.writer_ = writer;
                        return [4 /*yield*/, writer.write(value)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        writer.releaseLock();
                        this.writer_ = undefined;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * implement IDevice
         */
        this.close = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.deviceState$.value === "closed") {
                            console.log("ignore close, already closed");
                            return [2 /*return*/];
                        }
                        if (this.deviceState$.value === "closing") {
                            console.log("ignore close, already closing");
                            return [2 /*return*/];
                        }
                        this.deviceState$.next("closing");
                        if (this.reader_) {
                            this.reader_.cancel();
                            this.reader_ = undefined;
                        }
                        if (!this.readLoopPromise_) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.readLoopPromise_["catch"](function () {
                                /* ignore error */
                            })];
                    case 1:
                        _a.sent();
                        this.readLoopPromise_ = undefined;
                        _a.label = 2;
                    case 2:
                        if (this.writer_) {
                            if (!this.writer_.closed) {
                                this.writer_.close();
                            }
                            this.writer_ = undefined;
                        }
                        if (!this.writablePromise_) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.writablePromise_];
                    case 3:
                        _a.sent();
                        this.writablePromise_ = undefined;
                        _a.label = 4;
                    case 4:
                        if (this.port_) {
                            this.port_.close()["catch"](function () {
                                /* ignore error */
                            });
                            this.port_ = undefined;
                        }
                        this.deviceState$.next("closed");
                        return [2 /*return*/];
                }
            });
        }); };
    }
    return WebSerialDevice;
}());

var DELIMITER$1 = new Uint8Array([0x52, 0x58, 0x3d, 0x0, 0x0e]);
var chr = function (ch) { return ch.charCodeAt(0); };
var WiseXboardControl = /** @class */ (function () {
    function WiseXboardControl(device_) {
        var _this = this;
        this.device_ = device_;
        this.readNext_ = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var minTimestamp;
            return __generator(this, function (_a) {
                minTimestamp = Date.now();
                return [2 /*return*/, rxjs.firstValueFrom(this.chunk$.pipe(rxjs.filter(function (it) { return it.timestamp > minTimestamp; }), rxjs.map(function (it) { return it.value; })))];
            });
        }); };
        this.observeData = function () {
            return _this.chunk$.pipe(rxjs.map(function (it) { return it.value; }));
        };
        this.analogRead = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readNext_(ctx)
                        // [pin1 ~ pin5]
                    ];
                    case 1:
                        values = _a.sent();
                        // [pin1 ~ pin5]
                        return [2 /*return*/, new Array(5).fill(0).map(function (_, i) { var _a; return (_a = values[i]) !== null && _a !== void 0 ? _a : 0; })];
                }
            });
        }); };
        this.digitalRead = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analogRead(ctx)
                        // [pin1 ~ pin5]
                    ];
                    case 1:
                        values = _a.sent();
                        // [pin1 ~ pin5]
                        return [2 /*return*/, values.map(function (v) { return (v > 100 ? 1 : 0); })];
                }
            });
        }); };
        this.digitalWrite = function (ctx, pin, value) { return __awaiter(_this, void 0, void 0, function () {
            var pkt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        value = value > 0 ? 1 : 0;
                        pkt = [chr('X'), chr('R'), 2, 0, 0, 0, 0, 0, chr('S')];
                        pkt[2 + pin] = value;
                        console.log("digitalWrite: pin=".concat(pin, ", value=").concat(value));
                        return [4 /*yield*/, this.device_.write(new Uint8Array(pkt))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.setHumanoidMotion = function (ctx, index) { return __awaiter(_this, void 0, void 0, function () {
            var pkt, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pkt = [0xff, 0xff, 0x4c, 0x53, 0, 0, 0, 0, 0x30, 0x0c, 0x03, index, 0, 100, 0];
                        for (i = 6; i < 14; i++) {
                            pkt[14] += pkt[i];
                        }
                        return [4 /*yield*/, this.device_.write(new Uint8Array(pkt))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.stopDCMotor = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var pkt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pkt = [chr('X'), chr('R'), 0, 0, 0, 0, 0, 0, chr('S')];
                        return [4 /*yield*/, this.device_.write(new Uint8Array(pkt))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendPacketMRTEXE_(2)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.setDCMotorSpeed = function (ctx, l1, r1, l2, r2) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (l1 < -10)
                            l1 = -10;
                        if (r1 < -10)
                            r1 = -10;
                        if (l2 > 10)
                            l2 = 10;
                        if (r2 > 10)
                            r2 = 10;
                        if (l1 < 0)
                            l1 = 256 + l1;
                        if (l2 < 0)
                            l2 = 256 + l2;
                        if (r1 < 0)
                            r1 = 256 + r1;
                        if (r2 < 0)
                            r2 = 256 + r2;
                        console.log("setDCMotorSpeed : l1: ".concat(l1, ", r1:").concat(r1, ", l2:").concat(l2, ", r2: ").concat(r2));
                        return [4 /*yield*/, this.device_.write(new Uint8Array([chr('X'), chr('R'), 0, l1, r1, l2, r2, 0, chr('S')]))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendPacketMRTEXE_(2)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.setServoMotorAngle = function (ctx, pinNum, angle) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("setServoMotorAngle : pinNo: ".concat(pinNum, ", angle:").concat(angle));
                        if (angle < -90)
                            angle = -90;
                        if (angle > 90)
                            angle = 90;
                        if (angle < 0)
                            angle = 255 + angle;
                        if (pinNum < 1)
                            pinNum = 1;
                        if (pinNum > 5)
                            pinNum = 5;
                        return [4 /*yield*/, this.device_.write(new Uint8Array([chr('X'), chr('R'), 3, pinNum, angle, 0, 0, 0, chr('S')]))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendPacketMRTEXE_(2)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.onAfterOpen = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('XXX onAfterOpen()');
                return [2 /*return*/];
            });
        }); };
        this.onBeforeClose = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('XXX onBeforeClose()');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.stopDCMotor(ctx)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        // 모든 LED OFF
                        // 아무핀에나 0을 쓰면 모두 0이 된다.
                        return [4 /*yield*/, this.digitalWrite(ctx, 1, 0)];
                    case 5:
                        // 모든 LED OFF
                        // 아무핀에나 0을 쓰면 모두 0이 된다.
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.chunk$ = this.device_.observeReceivedData().pipe(rxjs.map(function (it) { return it.dataBuffer; }), DelimiterParser.parse({
            delimiter: DELIMITER$1,
            includeDelimiter: false
        }), rxjs.timestamp(), rxjs.shareReplay(1));
    }
    // isReadable = (): boolean => {
    //     return this.device_.isOpened()
    // }
    WiseXboardControl.prototype.sendPacketMRTEXE_ = function (exeIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var pkt, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pkt = [0xff, 0xff, 0x4c, 0x53, 0, 0, 0, 0, 0x30, 0x0c, 0x03, exeIndex, 0, 100, 0];
                        for (i = 6; i < 14; i++) {
                            pkt[14] += pkt[i];
                        }
                        return [4 /*yield*/, this.device_.write(new Uint8Array(pkt))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WiseXboardControl;
}());

Buffer.from([0x52, 0x58, 0x3d, 0x0, 0x0e]);
var wiseXboard = {
    hwId: 'wiseXboard',
    hwKind: 'serial',
    createControl: function (ctx) {
        var device = ctx.device;
        return new WiseXboardControl(device);
    }
};

var DELIMITER = new Uint8Array([0x23, 0x08, 0x0]);
var WiseXboardPremiumControl = /** @class */ (function () {
    function WiseXboardPremiumControl(device_) {
        var _this = this;
        this.device_ = device_;
        this.readNext_ = function (minTimestamp) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, rxjs.firstValueFrom(this.chunk$.pipe(rxjs.filter(function (it) { return it.timestamp > minTimestamp; }), rxjs.map(function (it) { return it.value; })))];
            });
        }); };
        this.observeData = function () {
            return _this.chunk$.pipe(rxjs.map(function (it) { return it.value; }));
        };
        this.isReadable = function () {
            return _this.device_.isOpened();
        };
        this.onAfterOpen = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('XXX onAfterOpen()');
                return [2 /*return*/];
            });
        }); };
        this.onBeforeClose = function () { return __awaiter(_this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('XXX onBeforeClose()');
                        if (!this.device_.isOpened)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.stopDCMotorP()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 9, , 10]);
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < 7)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.digitalWriteP(i, 0)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.chunk$ = this.device_.observeReceivedData().pipe(rxjs.map(function (it) { return it.dataBuffer; }), DelimiterParser.parse({
            delimiter: DELIMITER,
            includeDelimiter: false
        }), rxjs.timestamp(), rxjs.shareReplay(1));
    }
    /**
     * DC 모터1,2 속도 설정
     */
    WiseXboardPremiumControl.prototype.setDCMotorSpeedP = function (l1, r1, l2, r2) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, cksum, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (l1 < -100)
                            l1 = -100;
                        if (r1 < -100)
                            r1 = -100;
                        if (l1 > 100)
                            l1 = 100;
                        if (r1 > 100)
                            r1 = 100;
                        if (l2 < -100)
                            l2 = -100;
                        if (r2 < -100)
                            r2 = -100;
                        if (l2 > 100)
                            l2 = 100;
                        if (r2 > 100)
                            r2 = 100;
                        if (l1 < 0)
                            l1 = 256 + l1;
                        if (l2 < 0)
                            l2 = 256 + l2;
                        if (r1 < 0)
                            r1 = 256 + r1;
                        if (r2 < 0)
                            r2 = 256 + r2;
                        console.log("setDCMotorSpeedP : l1: ".concat(l1, ", r1:").concat(r1, ", l2:").concat(l2, ", r2: ").concat(r2));
                        buf = [0x23, 5, 0x82, l1, r1, l2, r2, 0];
                        cksum = 0;
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * DC 모터1 속도 설정
     */
    WiseXboardPremiumControl.prototype.setDCMotor1SpeedP = function (l1, r1) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, cksum, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (l1 < -100)
                            l1 = -100;
                        if (r1 < -100)
                            r1 = -100;
                        if (l1 > 100)
                            l1 = 100;
                        if (r1 > 100)
                            r1 = 100;
                        if (l1 < 0)
                            l1 = 256 + l1;
                        if (r1 < 0)
                            r1 = 256 + r1;
                        console.log("setDCMotor1SpeedP : l1: ".concat(l1, ", r1:").concat(r1));
                        buf = [0x23, 3, 0x85, l1, r1, 0];
                        cksum = 0;
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * DC 모터2 속도 설정
     */
    WiseXboardPremiumControl.prototype.setDCMotor2SpeedP = function (l2, r2) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, cksum, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (l2 < -100)
                            l2 = -100;
                        if (r2 < -100)
                            r2 = -100;
                        if (l2 > 100)
                            l2 = 100;
                        if (r2 > 100)
                            r2 = 100;
                        if (l2 < 0)
                            l2 = 256 + l2;
                        if (r2 < 0)
                            r2 = 256 + r2;
                        console.log("setDCMotor2SpeedP : l2: ".concat(l2, ", r2:").concat(r2));
                        buf = [0x23, 3, 0x86, l2, r2, 0];
                        cksum = 0;
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 일곱개의 핀값을 읽는다
     */
    WiseXboardPremiumControl.prototype._read7 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buf, cksum, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readNext_(Date.now())];
                    case 1:
                        buf = _a.sent();
                        if (buf.length != 8) {
                            console.warn('check delimiter', [].slice.call(buf));
                        }
                        if (buf.length < 8) {
                            throw new Error('invalid line');
                        }
                        cksum = 0;
                        for (i = 0; i < 7; i++) {
                            cksum ^= buf[i];
                        }
                        if (cksum != buf[7]) {
                            throw new Error('checksum mismatch');
                        }
                        return [2 /*return*/, new Array(7).fill(0).map(function (_, i) { var _a; return (_a = buf[i]) !== null && _a !== void 0 ? _a : 0; })];
                }
            });
        });
    };
    /**
     * 일곱개의 핀값을 읽는다
     * 첵섬이 다르거나, 구분자가 다르면 한번더 시도한다
     */
    WiseXboardPremiumControl.prototype._read7Retry = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var remainCount, i, ret, err_2, msg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        remainCount = 2;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < remainCount)) return [3 /*break*/, 6];
                        remainCount--;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._read7()];
                    case 3:
                        ret = _b.sent();
                        console.log('_read7Retry() = ', ret);
                        return [2 /*return*/, ret];
                    case 4:
                        err_2 = _b.sent();
                        msg = (_a = err_2.message) !== null && _a !== void 0 ? _a : '';
                        if (msg.includes('checksum mismatch') ||
                            msg.includes('check delimiter') ||
                            msg.includes('invalid line')) {
                            console.log('retry _read7()');
                            return [3 /*break*/, 5];
                        }
                        throw err_2;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, new Array(7).fill(0)];
                }
            });
        });
    };
    /**
     * 모든 DC 모터 끄기
     */
    WiseXboardPremiumControl.prototype.stopDCMotorP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pkt, cksum, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('stopDCMotorP()');
                        pkt = [0x23, 1, 0x83, 0];
                        cksum = 0;
                        for (i = 2; i < pkt.length - 1; i++) {
                            cksum ^= pkt[i];
                        }
                        pkt[pkt.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(pkt))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * n번핀 서보모터 각도 angle로 정하기
     * pinNum = [1,5], angle=[-90, 90]
     */
    WiseXboardPremiumControl.prototype.setServoMotorAngleP = function (pinNum, angle) {
        return __awaiter(this, void 0, void 0, function () {
            var speed, cksum, buf, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("setServoMotorAngleP() : pinNo:".concat(pinNum, ", angle:").concat(angle));
                        if (angle < -90)
                            angle = -90;
                        if (angle > 90)
                            angle = 90;
                        if (angle < 0)
                            angle = 255 + angle;
                        speed = 20;
                        if (pinNum < 3)
                            pinNum = 3;
                        if (pinNum > 6)
                            pinNum = 6;
                        cksum = 0;
                        buf = [0x23, 4, 0x81, pinNum, angle, speed, 0];
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 리모콘 값 읽기
     */
    WiseXboardPremiumControl.prototype.readRemoconP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('readRemoconP()');
                        return [4 /*yield*/, this._read7Retry()];
                    case 1:
                        values = _a.sent();
                        return [2 /*return*/, values[6]];
                }
            });
        });
    };
    /**
     * 아날로그 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    WiseXboardPremiumControl.prototype.analogReadP = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('analogReadP()');
                // [pin1 ~ pin7]
                return [2 /*return*/, this._read7Retry()];
            });
        });
    };
    /**
     * 디지털 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    WiseXboardPremiumControl.prototype.digitalReadP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('digitalReadP()');
                        return [4 /*yield*/, this._read7Retry()];
                    case 1:
                        values = _a.sent();
                        return [2 /*return*/, values.map(function (it) { return (it > 100 ? 1 : 0); })];
                }
            });
        });
    };
    /**
     * 디지털 n번핀 value로 정하기
     * pinNum = [0~5], value = [0,1]
     */
    WiseXboardPremiumControl.prototype.digitalWriteP = function (pinNum, value) {
        return __awaiter(this, void 0, void 0, function () {
            var cksum, buf, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        value = value <= 0 ? 0 : 1;
                        pinNum = pinNum <= 0 ? 0 : pinNum >= 5 ? 5 : pinNum;
                        console.log("digitalWriteP : pinNo: ".concat(pinNum, ", value:").concat(value));
                        cksum = 0;
                        buf = [0x23, 3, 0x80, pinNum, value, 0];
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        console.log("digitalWriteP : buf=", buf);
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 키값 전송
     */
    WiseXboardPremiumControl.prototype.sendKeyP = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var cksum, buf, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("sendKeyP(): key: ".concat(key));
                        cksum = 0;
                        buf = [0x23, 2, 0x84, key, 0];
                        for (i = 2; i < buf.length - 1; i++) {
                            cksum ^= buf[i];
                        }
                        buf[buf.length - 1] = cksum;
                        return [4 /*yield*/, this.device_.write(new Uint8Array(buf))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WiseXboardPremiumControl;
}());

var wiseXboardPremium = {
    hwId: 'wiseXboardPremium',
    hwKind: 'serial',
    createControl: function (ctx) {
        var device = ctx.device;
        return new WiseXboardPremiumControl(device);
    }
};

var hardwares = [wiseXboard, wiseXboardPremium];

exports.DelimiterParser = DelimiterParser;
exports.WebSerialDevice = WebSerialDevice;
exports.hardwares = hardwares;
//# sourceMappingURL=index.js.map
