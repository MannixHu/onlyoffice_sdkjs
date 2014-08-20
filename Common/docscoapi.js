﻿"use strict";

(function (global) {
    'use strict';
	
	var asc			= window["Asc"];
	var asc_user	= asc.asc_CUser;
	var asc_coAuthV	= '3.0.1';

	// Класс надстройка, для online и offline работы
	var CDocsCoApi = function (options) {
		this._CoAuthoringApi = new DocsCoApi();
		this._onlineWork = false;

		if (options) {
			this.onAuthParticipantsChanged = options.onAuthParticipantsChanged;
			this.onParticipantsChanged = options.onParticipantsChanged;
			this.onMessage = options.onMessage;
			this.onLocksAcquired = options.onLocksAcquired;
			this.onLocksReleased = options.onLocksReleased;
			this.onLocksReleasedEnd = options.onLocksReleasedEnd; // ToDo переделать на массив release locks
			this.onDisconnect = options.onDisconnect;
			this.onFirstLoadChanges = options.onFirstLoadChanges;
			this.onFirstLoadChangesEnd = options.onFirstLoadChangesEnd;
			this.onConnectionStateChanged = options.onConnectionStateChanged;
			this.onSetIndexUser = options.onSetIndexUser;
			this.onSaveChanges = options.onSaveChanges;
			this.onStartCoAuthoring = options.onStartCoAuthoring;
			this.onEndCoAuthoring = options.onEndCoAuthoring;
		}
	};

	CDocsCoApi.prototype.init = function (user, docid, token, callback, editorType, documentFormatSave, isViewer) {
		if (this._CoAuthoringApi && this._CoAuthoringApi.isRightURL()) {
			var t = this;
			this._CoAuthoringApi.onAuthParticipantsChanged = function (e, count) {t.callback_OnAuthParticipantsChanged(e, count);};
			this._CoAuthoringApi.onParticipantsChanged = function (e, count) {t.callback_OnParticipantsChanged(e, count);};
			this._CoAuthoringApi.onMessage = function (e) {t.callback_OnMessage(e);};
			this._CoAuthoringApi.onLocksAcquired = function (e) {t.callback_OnLocksAcquired(e);};
			this._CoAuthoringApi.onLocksReleased = function (e, bChanges) {t.callback_OnLocksReleased(e, bChanges);};
			this._CoAuthoringApi.onLocksReleasedEnd = function () {t.callback_OnLocksReleasedEnd();};
			this._CoAuthoringApi.onDisconnect = function (e, isDisconnectAtAll, isCloseCoAuthoring) {t.callback_OnDisconnect(e, isDisconnectAtAll, isCloseCoAuthoring);};
			this._CoAuthoringApi.onFirstLoadChanges = function (e, userId) {t.callback_OnFirstLoadChanges(e, userId);};
			this._CoAuthoringApi.onFirstLoadChangesEnd = function () {t.callback_OnFirstLoadChangesEnd();};
			this._CoAuthoringApi.onConnectionStateChanged = function (e) {t.callback_OnConnectionStateChanged(e);};
			this._CoAuthoringApi.onSetIndexUser = function (e) {t.callback_OnSetIndexUser(e);};
			this._CoAuthoringApi.onSaveChanges = function (e, userId) {t.callback_OnSaveChanges(e, userId);};
			// Callback есть пользователей больше 1
			this._CoAuthoringApi.onStartCoAuthoring = function (e) {t.callback_OnStartCoAuthoring(e);};
			this._CoAuthoringApi.onEndCoAuthoring = function (e) {t.callback_OnEndCoAuthoring(e);};

			this._CoAuthoringApi.init(user, docid, token, callback, editorType, documentFormatSave, isViewer);
			this._onlineWork = true;
		}
		else {
			// Фиктивные вызовы
			this.callback_OnSetIndexUser ("123");
			this.onFirstLoadChangesEnd ();
		}
	};

	CDocsCoApi.prototype.set_url = function (url) {
		if (this._CoAuthoringApi)
			this._CoAuthoringApi.set_url(url);
	};
	
	CDocsCoApi.prototype.get_onlineWork = function () {
		return this._onlineWork;
	};

	CDocsCoApi.prototype.get_state = function () {
		if (this._CoAuthoringApi)
			return this._CoAuthoringApi.get_state();

		return 0;
	};
	
	CDocsCoApi.prototype.getMessages = function () {
		if (this._CoAuthoringApi && this._onlineWork)
			this._CoAuthoringApi.getMessages();
	};

	CDocsCoApi.prototype.sendMessage = function (message) {
		if (this._CoAuthoringApi && this._onlineWork)
			this._CoAuthoringApi.sendMessage(message);
	};

	CDocsCoApi.prototype.askLock = function (arrayBlockId, callback) {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.askLock(arrayBlockId, callback);
		}
		else {
			var t = this;
			window.setTimeout(function () {
					if (callback && _.isFunction(callback)) {
						var lengthArray = (arrayBlockId) ? arrayBlockId.length : 0;
						if (0 < lengthArray) {
							callback({"lock": arrayBlockId[0]});
							// Фиктивные вызовы
							for (var i = 0; i < lengthArray; ++i) {
								t.callback_OnLocksAcquired ({"state" : 2, "block": arrayBlockId[i]});
							}
						}
					}
			}, 1);
		}
	};
	
	CDocsCoApi.prototype.askSaveChanges = function (callback) {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.askSaveChanges(callback);
		} else {
			window.setTimeout(function () {
				if (callback && _.isFunction(callback)) {
					// Фиктивные вызовы
					callback({"saveLock": false});
				}
			}, 100);
		}
	};
	
	CDocsCoApi.prototype.unSaveChanges = function () {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.unSaveChanges();
		}
	};

	CDocsCoApi.prototype.saveChanges = function (arrayChanges, deleteIndex) {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.saveChanges(arrayChanges, null, deleteIndex);
		}
	};

	CDocsCoApi.prototype.unLockDocument = function (isSave) {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.unLockDocument(isSave);
		}
	};
	
	CDocsCoApi.prototype.getUsers = function () {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.getUsers();
		}
	};

	CDocsCoApi.prototype.getUser = function (userId) {
		if (this._CoAuthoringApi && this._onlineWork)
			return this._CoAuthoringApi.getUser(userId);
		return null;
	};

	CDocsCoApi.prototype.releaseLocks = function (blockId) {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.releaseLocks(blockId);
		}
	};
	
	CDocsCoApi.prototype.disconnect = function () {
		if (this._CoAuthoringApi && this._onlineWork) {
			this._CoAuthoringApi.disconnect();
		}
	};

	CDocsCoApi.prototype.callback_OnAuthParticipantsChanged = function (e, count) {
		if (this.onAuthParticipantsChanged)
			this.onAuthParticipantsChanged(e, count);
	};

	CDocsCoApi.prototype.callback_OnParticipantsChanged = function (e, count) {
		if (this.onParticipantsChanged)
			this.onParticipantsChanged(e, count);
	};

	CDocsCoApi.prototype.callback_OnMessage = function (e) {
		if (this.onMessage)
			this.onMessage(e);
	};

	CDocsCoApi.prototype.callback_OnLocksAcquired = function (e) {
		if (this.onLocksAcquired)
			this.onLocksAcquired(e);
	};

	CDocsCoApi.prototype.callback_OnLocksReleased = function (e, bChanges) {
		if (this.onLocksReleased)
			this.onLocksReleased(e, bChanges);
	};

	CDocsCoApi.prototype.callback_OnLocksReleasedEnd = function () {
		if (this.onLocksReleasedEnd)
			this.onLocksReleasedEnd();
	};

	/**
	 * Event об отсоединении от сервера
	 * @param {jQuery} e  event об отсоединении с причиной
	 * @param {Bool} isDisconnectAtAll  окончательно ли отсоединяемся(true) или будем пробовать сделать reconnect(false) + сами отключились
	 * @param {Bool} isCloseCoAuthoring
	 */
	CDocsCoApi.prototype.callback_OnDisconnect = function (e, isDisconnectAtAll, isCloseCoAuthoring) {
		if (this.onDisconnect)
			this.onDisconnect(e, isDisconnectAtAll, isCloseCoAuthoring);
	};

	CDocsCoApi.prototype.callback_OnFirstLoadChanges = function (e, userId) {
		if (this.onFirstLoadChanges)
			this.onFirstLoadChanges(e, userId);
	};

	CDocsCoApi.prototype.callback_OnFirstLoadChangesEnd = function () {
		if (this.onFirstLoadChangesEnd)
			this.onFirstLoadChangesEnd();
	};

	CDocsCoApi.prototype.callback_OnConnectionStateChanged = function (e) {
		if (this.onConnectionStateChanged)
			this.onConnectionStateChanged(e);
	};

	CDocsCoApi.prototype.callback_OnSetIndexUser = function (e) {
		if (this.onSetIndexUser)
			this.onSetIndexUser(e);
	};

	CDocsCoApi.prototype.callback_OnSaveChanges = function (e, userId) {
		if (this.onSaveChanges)
			this.onSaveChanges(e, userId);
	};
	CDocsCoApi.prototype.callback_OnStartCoAuthoring = function (e) {
		if (this.onStartCoAuthoring)
			this.onStartCoAuthoring(e);
	};
	CDocsCoApi.prototype.callback_OnEndCoAuthoring = function (e) {
		if (this.onEndCoAuthoring)
			this.onEndCoAuthoring(e);
	};

    /** States
	 * -1 - reconnect state
     *  0 - not initialized
     *  1 - waiting session id
     *  2 - authorized
	 *  3 - closed
     */
    var DocsCoApi = function (options) {
		if (options) {
			this.onAuthParticipantsChanged = options.onAuthParticipantsChanged;
			this.onParticipantsChanged = options.onParticipantsChanged;
			this.onMessage = options.onMessage;
			this.onLocksAcquired = options.onLocksAcquired;
			this.onLocksReleased = options.onLocksReleased;
			this.onLocksReleasedEnd = options.onLocksReleasedEnd; // ToDo переделать на массив release locks
			this.onRelockFailed = options.onRelockFailed;
			this.onDisconnect = options.onDisconnect;
			this.onConnect = options.onConnect;
			this.onSaveChanges = options.onSaveChanges;
			this.onFirstLoadChanges = options.onFirstLoadChanges;
			this.onFirstLoadChangesEnd = options.onFirstLoadChangesEnd;
			this.onConnectionStateChanged = options.onConnectionStateChanged;
		}
        this._state = 0;
		// Online-пользователи в документе
        this._participants = {};
		this._countEditUsers = 0;
		this._countUsers = 0;

        this._locks = {};
        this._msgBuffer = [];
        this._lockCallbacks = {};
		this._saveLock = false;
		this._saveCallback = [];
		this.saveCallbackErrorTimeOutId = null;
        this._id = "";
		this._indexuser = -1;
		// Если пользователей больше 1, то совместно редактируем
		this.isCoAuthoring = false;
		// Мы сами отключились от совместного редактирования
		this.isCloseCoAuthoring = false;
		
		// Максимальное число изменений, посылаемое на сервер (не может быть нечетным, т.к. пересчет обоих индексов должен быть)
		this.maxCountSaveChanges = 20000;
		// Текущий индекс для колличества изменений
		this.currentIndex = 0;
		// Индекс, с которого мы начинаем сохранять изменения
		this.deleteIndex = 0;
		// Массив изменений
		this.arrayChanges = null;
		
		this._url = "";

		this.reconnectTimeout = null;
		this.attemptCount = 0;
		this.maxAttemptCount = 50;
		this.reconnectInterval = 2000;

		this._docid = null;
		this._token = null;
		this._user = "Anonymous";
		this._initCallback = null;
		this.ownedLockBlocks = [];
		this.sockjs_url = null;
		this.sockjs = null;
		this._isExcel = false;
		this._isPresentation = false;
		this._isAuth = false;
		this._documentFormatSave = 0;
		this._isViewer = false;
    };
	
	DocsCoApi.prototype.isRightURL = function () {
        return ("" != this._url);
    };

	DocsCoApi.prototype.set_url = function (url) {
		this._url = url;
	};
	
	DocsCoApi.prototype.get_state = function () {
        return this._state;
    };
	
	DocsCoApi.prototype.get_indexUser = function () {
        return this._indexuser;
    };

    DocsCoApi.prototype.getSessionId = function () {
        return this._id;
    };

    DocsCoApi.prototype.getUser = function () {
        return this._user;
    };

    DocsCoApi.prototype.getLocks = function () {
        return this._locks;
    };

    DocsCoApi.prototype.askLock = function (arrayBlockId, callback) {
		// ask all elements in array
		var i = 0;
		var lengthArray = (arrayBlockId) ? arrayBlockId.length : 0;
		var isLock = false;
		var idLockInArray = null;
		for (; i < lengthArray; ++i) {
			idLockInArray = (this._isExcel) ? arrayBlockId[i].guid : (this._isPresentation) ? arrayBlockId[i]["guid"] : arrayBlockId[i];
			if (this._locks[idLockInArray] && 0 !== this._locks[idLockInArray].state) {
				isLock = true;
				break;
			}
		}
		if (0 === lengthArray)
			isLock = true;

		idLockInArray = (this._isExcel) ? arrayBlockId[0].guid : (this._isPresentation) ? arrayBlockId[0]["guid"] : arrayBlockId[0];

		if (!isLock) {
			//Ask
            this._locks[idLockInArray] = {"state": 1};//1-asked for block
            if (callback && _.isFunction(callback)) {
                this._lockCallbacks[idLockInArray] = callback;
                var lockCalbacks = this._lockCallbacks;

                //Set reconnectTimeout
                window.setTimeout(function () {
                    if (lockCalbacks.hasOwnProperty(idLockInArray)) {
                        //Not signaled already
                        callback({error: "Timed out"});
                        delete lockCalbacks[idLockInArray];
                    }
                }, 5000);//5 sec to signal lock failure
            }
			if (this._isExcel)
				this._send({"type": "getLockRange", "block": arrayBlockId});
			else if (this._isPresentation)
				this._send({"type": "getLockPresentation", "block": arrayBlockId});
			else
            	this._send({"type": "getLock", "block": arrayBlockId});
		} else {
			// Вернем ошибку, т.к. залочены элементы
			window.setTimeout(function () {
				if (callback && _.isFunction(callback)) {
					callback({error: idLockInArray + "-lock"});
				}
			}, 100);
		}
    };
	
	DocsCoApi.prototype.askSaveChanges = function (callback) {
		if (this._saveCallback[this._saveCallback.length - 1]) {
			// Мы еще не отработали старый callback и ждем ответа
			return;
		}

		// Очищаем предыдущий таймер
		if (null !== this.saveCallbackErrorTimeOutId)
			clearTimeout(this.saveCallbackErrorTimeOutId);

		// Проверим состояние, если мы не подсоединились, то сразу отправим ошибку
		if (-1 === this.get_state()) {
			this.saveCallbackErrorTimeOutId = window.setTimeout(function () {
				if (callback && _.isFunction(callback)) {
					// Фиктивные вызовы
					callback({error: "No connection"});
				}
			}, 100);
			return;
		}
		if (callback && _.isFunction(callback)) {
			var t = this;
			var indexCallback = this._saveCallback.length;
			this._saveCallback[indexCallback] = callback;
				
			//Set reconnectTimeout
			window.setTimeout(function () {
				t.saveCallbackErrorTimeOutId = null;
				var oTmpCallback = t._saveCallback[indexCallback];
				if (oTmpCallback) {
					t._saveCallback[indexCallback] = null;
					//Not signaled already
					oTmpCallback({error: "Timed out"});
				}
			}, 5000);//5 sec to signal lock failure
		}
		this._send({"type": "isSaveLock"});
	};
	
	DocsCoApi.prototype.unSaveChanges = function () {
		this._send({"type": "unSaveLock"});
	};

    DocsCoApi.prototype.releaseLocks = function (blockId) {
        if (this._locks[blockId] && 2 === this._locks[blockId].state /*lock is ours*/) {
            //Ask
            this._locks[blockId] = {"state": 0};//0-released
        }
    };
	
	DocsCoApi.prototype.saveChanges = function (arrayChanges, currentIndex, deleteIndex) {
		if (null === currentIndex) {
			this.deleteIndex = deleteIndex;
			this.currentIndex = 0;
			this.arrayChanges = arrayChanges;
		} else {
			this.currentIndex = currentIndex;
		}
		var startIndex = this.currentIndex * this.maxCountSaveChanges;
		var endIndex = Math.min(this.maxCountSaveChanges * (this.currentIndex + 1), arrayChanges.length);
		if (endIndex === arrayChanges.length) {
			for (var key in this._locks) if (this._locks.hasOwnProperty(key)) {
				if (2 === this._locks[key].state /*lock is ours*/)
					delete this._locks[key];
			}
		}

		this._send({"type": "saveChanges", "changes": JSON.stringify(arrayChanges.slice(startIndex, endIndex)),
			"startSaveChanges": (startIndex === 0), "endSaveChanges": (endIndex === arrayChanges.length),
			"isCoAuthoring": this.isCoAuthoring, "isExcel": this._isExcel, "deleteIndex": this.deleteIndex,
			"startIndex": startIndex});
	};

	DocsCoApi.prototype.unLockDocument = function (isSave) {
		this._send({'type': 'unLockDocument', 'isSave' : isSave});
	};

    DocsCoApi.prototype.getUsers = function () {
		// Специально для возможности получения после прохождения авторизации (Стоит переделать)
		if (this.onAuthParticipantsChanged)
			this.onAuthParticipantsChanged(this._participants, this._countUsers);
    };

	DocsCoApi.prototype.getUser = function (userId) {
		return this._participants[userId];
	};

    DocsCoApi.prototype.disconnect = function () {
		// Отключаемся сами
		this.isCloseCoAuthoring = true;
        return this.sockjs.close();
    };

    DocsCoApi.prototype.getMessages = function () {
        this._send({"type": "getMessages"});
    };

    DocsCoApi.prototype.sendMessage = function (message) {
        if (typeof message === 'string') {
            this._send({"type": "message", "message": message});
        }
    };

    DocsCoApi.prototype._sendPrebuffered = function () {
        for (var i = 0; i < this._msgBuffer.length; i++) {
            this._send(this._msgBuffer[i]);
        }
        this._msgBuffer = [];
    };

    DocsCoApi.prototype._send = function (data) {
        if (data !== null && typeof data === "object") {
            if (this._state > 0) {
                this.sockjs.send(JSON.stringify(data));
            }
            else {
                this._msgBuffer.push(data);
            }
        }
    };

    DocsCoApi.prototype._onMessages = function (data) {
        if (data["messages"] && this.onMessage) {
            this.onMessage(data["messages"]);
        }
    };

    DocsCoApi.prototype._onGetLock = function (data) {
        if (data["locks"]) {
            for (var key in data["locks"]) {
                if (data["locks"].hasOwnProperty(key)) {
                    var lock = data["locks"][key],
						blockTmp = (this._isExcel) ? lock["block"]["guid"] : (this._isPresentation) ? lock["block"]["guid"] : key,
						blockValue = (this._isExcel) ? lock["block"] : (this._isPresentation) ? lock["block"] : key;
                    if (lock !== null) {
                        var changed = true;
                        if (this._locks[blockTmp] && 1 !== this._locks[blockTmp].state /*asked for it*/) {
                            //Exists
                            //Check lock state
                            changed = !(this._locks[blockTmp].state === (lock["sessionId"] === this._id ? 2 : 3) &&
                                this._locks[blockTmp]["user"] === lock["user"] &&
                                this._locks[blockTmp]["time"] === lock["time"] &&
                                this._locks[blockTmp]["block"] === blockTmp);
                        }

                        if (changed) {
                            this._locks[blockTmp] = {"state":lock["sessionId"] === this._id ? 2 : 3, "user":lock["user"], "time":lock["time"], "block": blockTmp, "blockValue": blockValue};//2-acquired by me!
                        }
                        if (this._lockCallbacks.hasOwnProperty(blockTmp) &&
                            this._lockCallbacks[blockTmp] !== null &&
                            _.isFunction(this._lockCallbacks[blockTmp])) {
                            if (lock["sessionId"] === this._id) {
                                //Do call back
                                this._lockCallbacks[blockTmp]({"lock":this._locks[blockTmp]});
                            }
                            else {
                                this._lockCallbacks[blockTmp]({"error":"Already locked by " + lock["user"]});
                            }
                            delete this._lockCallbacks[blockTmp];
                        }
                        if (this.onLocksAcquired && changed) {
                            this.onLocksAcquired(this._locks[blockTmp]);
                        }
                    }
                }
            }
        }
    };

    DocsCoApi.prototype._onReleaseLock = function (data) {
        if (data["locks"]) {
			var bSendEnd = false;
            for (var block in data["locks"]) {
                if (data["locks"].hasOwnProperty(block)) {
                    var lock = data["locks"][block],
						blockTmp = (this._isExcel) ? lock["block"]["guid"] : (this._isPresentation) ? lock["block"]["guid"] : lock["block"];
                    if (lock !== null) {
                        this._locks[blockTmp] = {"state":0, "user":lock["user"], "time":lock["time"], "changes":lock["changes"], "block":lock["block"]};
                        if (this.onLocksReleased) {
							// false - user not save changes
                            this.onLocksReleased(this._locks[blockTmp], false);
							bSendEnd = true;
                        }
                    }
                }
            }
			if (bSendEnd && this.onLocksReleasedEnd)
				this.onLocksReleasedEnd();
        }
    };
	
	DocsCoApi.prototype._onSaveChanges = function (data) {
        if (data["locks"]) {
			var bSendEnd = false;
            for (var block in data["locks"]) {
                if (data["locks"].hasOwnProperty(block)) {
                    var lock = data["locks"][block],
						blockTmp = (this._isExcel) ? lock["block"]["guid"] : (this._isPresentation) ? lock["block"]["guid"] : lock["block"];
                    if (lock !== null) {
                        this._locks[blockTmp] = {"state":0, "user":lock["user"], "time":lock["time"], "changes":lock["changes"], "block":lock["block"]};
                        if (this.onLocksReleased) {
							// true - lock with save
                            this.onLocksReleased(this._locks[blockTmp], true);
							bSendEnd = true;
                        }
                    }
                }
            }
			if (bSendEnd && this.onLocksReleasedEnd)
				this.onLocksReleasedEnd();
        }
		if (data["changes"]) {
			if (this.onSaveChanges) {
				this.onSaveChanges(JSON.parse(data["changes"]), data["user"]);
			}
		}
    };
	
	DocsCoApi.prototype._onStartCoAuthoring = function (isStartEvent) {
		if (false === this.isCoAuthoring) {
			this.isCoAuthoring = true;
			if (this.onStartCoAuthoring) {
				this.onStartCoAuthoring(isStartEvent);
			}
		}
	};

	DocsCoApi.prototype._onEndCoAuthoring = function (isStartEvent) {
		if (true === this.isCoAuthoring) {
			this.isCoAuthoring = false;
			if (this.onEndCoAuthoring) {
				this.onEndCoAuthoring(isStartEvent);
			}
		}
	};
	
	DocsCoApi.prototype._onSaveLock = function (data) {
		if (undefined != data["saveLock"] && null != data["saveLock"]) {
			var indexCallback = this._saveCallback.length - 1;
			var oTmpCallback = this._saveCallback[indexCallback];
			if (oTmpCallback) {
				// Очищаем предыдущий таймер
				if (null !== this.saveCallbackErrorTimeOutId)
					clearTimeout(this.saveCallbackErrorTimeOutId);

				this._saveCallback[indexCallback] = null;
				oTmpCallback(data);
			}
		}
	};
	
	DocsCoApi.prototype._onUnSaveLock = function (data) {
		this._saveLock = false;
		if (this.onUnSaveLock)
			this.onUnSaveLock ();
	};

    DocsCoApi.prototype._onFirstLoadChanges = function (allServerChanges) {
		var t = this;
        if (allServerChanges && this.onFirstLoadChanges) {
			var hasChanges = false;
			for (var changeId in allServerChanges) if (allServerChanges.hasOwnProperty(changeId)){
				var change = allServerChanges[changeId];
				var changesOneUser = change["changes"];
				if (changesOneUser) {
					hasChanges = true;
					t.onFirstLoadChanges(JSON.parse(changesOneUser), change["user"]);
				}
			}

			// Посылать нужно всегда, т.к. на это рассчитываем при открытии
			if (t.onFirstLoadChangesEnd)
				t.onFirstLoadChangesEnd();
        }
    };
	
	DocsCoApi.prototype._onSetIndexUser = function (data) {
		if (data && this.onSetIndexUser) {
			this.onSetIndexUser (data);
		}
	};
	
	DocsCoApi.prototype._onSavePartChanges = function () {
		this.saveChanges (this.arrayChanges, this.currentIndex + 1);
	};

    DocsCoApi.prototype._onPreviousLocks = function (locks, previousLocks) {
        var i=0;
        if (locks && previousLocks) {
            for (var block in locks) {
                if (locks.hasOwnProperty(block)) {
                    var lock = locks[block];
                    if (lock !== null && lock["block"]) {
                        //Find in previous
                        for (i=0; i < previousLocks.length; i++) {
                            if (previousLocks[i] === lock["block"] && lock["sessionId"] === this._id) {
                                //Lock is ours
                                previousLocks.remove(i);
                                break;
                            }
                        }
                    }
                }
            }
            if (previousLocks.length>0 && this.onRelockFailed)  {
                this.onRelockFailed(previousLocks);
            }
            previousLocks=[];
        }
    };
	
	DocsCoApi.prototype._onAuthParticipantsChanged = function (participants) {
		this._participants = {};
		this._countEditUsers = 0;
		this._countUsers = 0;

		if (participants) {
			var tmpUser;
			for (var i = 0; i < participants.length; ++i) {
				tmpUser = new asc_user(participants[i]);
				this._participants[tmpUser.asc_getId()] = tmpUser;
				// Считаем только число редакторов
				if (!tmpUser.asc_getView())
					++this._countEditUsers;
				++this._countUsers;
			}

			if (this.onAuthParticipantsChanged)
				this.onAuthParticipantsChanged(this._participants, this._countUsers);
			
			// Посылаем эвент о совместном редактировании
			if (1 < this._countEditUsers)
				this._onStartCoAuthoring(/*isStartEvent*/true);
			else
				this._onEndCoAuthoring(/*isStartEvent*/true);
		}
	};

	DocsCoApi.prototype._onConnectionStateChanged = function (data) {
		var userStateChanged = null, userId, stateChanged = false, isEditUser = true;
		if (undefined !== data["state"] && this.onConnectionStateChanged) {
			userStateChanged = new asc_user(data);

			userId = userStateChanged.asc_getId();
			isEditUser = !userStateChanged.asc_getView();
			if (userStateChanged.asc_getState()) {
				this._participants[userId] = userStateChanged;
				++this._countUsers;
				if (isEditUser)
					++this._countEditUsers;
				stateChanged = true;
			} else if (this._participants.hasOwnProperty(userId)){
				delete this._participants[userId];
				--this._countUsers;
				if (isEditUser)
					--this._countEditUsers;
				stateChanged = true;
			}

			if (stateChanged) {
				// Посылаем эвент о совместном редактировании
				if (1 < this._countEditUsers)
					this._onStartCoAuthoring(/*isStartEvent*/false);
				else
					this._onEndCoAuthoring(/*isStartEvent*/false);

				this.onParticipantsChanged(this._participants, this._countUsers);
				this.onConnectionStateChanged(userStateChanged);
			}
		}
	};

	DocsCoApi.prototype._onDrop = function (data) {
		this.disconnect();
		this.onDisconnect(data['description'], true, false);
	};

	DocsCoApi.prototype._onAuth = function (data) {
		if (true === this._isAuth) {
			// Мы уже авторизовывались, это просто reconnect
			return;
		}
		if (data["result"] === 1) {
			// Выставляем флаг, что мы уже авторизовывались
			this._isAuth = true;

			//TODO: add checks
			this._state = 2; // Authorized
			this._id = data["sessionId"];

			this._onAuthParticipantsChanged(data["participants"]);

			if (data["indexUser"]) {
				this._indexuser = data["indexUser"];
				this._onSetIndexUser (this._indexuser);
			}

			if (data["messages"] && this.onMessage) {
				this._onMessages(data);
			}
			if (data["locks"]) {
				if (this.ownedLockBlocks && this.ownedLockBlocks.length > 0) {
					this._onPreviousLocks(data["locks"], this.ownedLockBlocks);
				}
				this._onGetLock(data);
			}
			// Нужно послать фиктивное завершение (эта функция означает что мы соединились)
			this._onFirstLoadChanges(data["changes"] || []);

			//Send prebuffered
			this._sendPrebuffered();
		}
		//TODO: Add errors
		if (this._initCallback) {
			this._initCallback({result:data["result"]});
		}
	};

    DocsCoApi.prototype.init = function (user, docid, token, callback, editorType, documentFormatSave, isViewer) {
        this._user = user;
        this._docid = docid;
        this._token = token;
        this._initCallback = callback;
        this.ownedLockBlocks = [];
		this.sockjs_url = this._url + '/doc/'+docid+'/c';
		this._isExcel = c_oEditorId.Spreadsheet === editorType;
		this._isPresentation = c_oEditorId.Presentation === editorType;
		this._isAuth = false;
		this._documentFormatSave = documentFormatSave;
		this._isViewer = isViewer;

		this._initSocksJs()
    };

	DocsCoApi.prototype._initSocksJs = function ()  {
		var t = this;
		var sockjs = this.sockjs = new SockJS(this.sockjs_url, null, {debug: true});

		sockjs.onopen = function () {
			if (t.reconnectTimeout) {
				clearTimeout(t.reconnectTimeout);
				t.attemptCount = 0;
			}

			t._state = 1; // Opened state
			if (t.onConnect) {
				t.onConnect();
			}
			if (t._locks) {
				t.ownedLockBlocks = [];
				//If we already have locks
				for (var block in t._locks) {
					if (t._locks.hasOwnProperty(block)) {
						var lock = t._locks[block];
						if (lock["state"] === 2) {
							//Our lock.
							t.ownedLockBlocks.push(lock["block"]);
						}
					}
				}
				t._locks = {};
			}
			t._send(
				{
					'type'	: 'auth',
					'docid'	: t._docid,
					'token'	: t._token,
					'user'	: {
						'id'	: t._user.asc_getId(),
						'name'	: t._user.asc_getUserName(),
						'color'	: t._user.asc_getColorValue()
					},
					'locks'		: t.ownedLockBlocks,
					'sessionId'	: t._id,
					'server'	: {
						'https'	: 'https:' === window.location.protocol,
						'host'	: window.location.hostname,
						'port'	: window.location.port || '',
						'path'	: g_sMainServiceLocalUrl
					},
					'documentFormatSave'	: t._documentFormatSave,
					'isViewer'	: t._isViewer,
					'version'	: asc_coAuthV
				});

		};
		sockjs.onmessage = function (e) {
			//TODO: add checks and error handling
			//Get data type
			var dataObject = JSON.parse(e.data);
			var type = dataObject.type;
			switch (type) {
				case 'auth'				: t._onAuth(dataObject); break;
				case 'message'			: t._onMessages(dataObject); break;
				case 'getLock'			: t._onGetLock(dataObject); break;
				case 'releaseLock'		: t._onReleaseLock(dataObject); break;
				case 'connectState'		: t._onConnectionStateChanged(dataObject); break;
				case 'saveChanges'		: t._onSaveChanges(dataObject); break;
				case 'saveLock'			: t._onSaveLock(dataObject); break;
				case 'unSaveLock'		: t._onUnSaveLock(dataObject); break;
				case 'savePartChanges'	: t._onSavePartChanges(); break;
				case 'drop'				: t._onDrop(dataObject); break;
				case 'waitAuth'			: /*Ждем, когда придет auth, документ залочен*/break;
				case 'error'			: /*Старая версия sdk*/t._onDrop(dataObject); break;
			}
		};
		sockjs.onclose = function (evt) {
			t._state = -1; // Reconnect state
			var bIsDisconnectAtAll = t.attemptCount >= t.maxAttemptCount || t.isCloseCoAuthoring;
			if (bIsDisconnectAtAll)
				t._state = 3; // Closed state
			if (t.onDisconnect) {
				t.onDisconnect(evt.reason, bIsDisconnectAtAll, t.isCloseCoAuthoring);
			}
			if (t.isCloseCoAuthoring)
				return;
			//Try reconect
			if (t.attemptCount < t.maxAttemptCount) {
				t._tryReconnect();
			}
		};

		return sockjs;
	};

	DocsCoApi.prototype._tryReconnect = function () {
		var t = this;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
		}
		++this.attemptCount;
		this.reconnectTimeout = setTimeout(function () {
			delete t.sockjs;
			t._initSocksJs();
		}, this.reconnectInterval);

	};

    global["CDocsCoApi"] = CDocsCoApi;
})(window);