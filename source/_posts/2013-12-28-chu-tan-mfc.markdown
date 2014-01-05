---
layout: post
title: "初探 MFC"
date: 2013-12-28 22:13:34 +0800
comments: true
categories: 
---
这几天要写智能卡大作业，老师要求必须有图形界面。
作业本身没什么难的，调用提供的API函数完成相应功能。倒是图形界面让我觉得比较有趣，以前一直用java写图形界面。但是java程序运行起来比较麻烦，首先得有jre，其次jar也不一定能双击运行，当时就萌生了写个MFC程序的念头，囿于时间有限一直没学习。这次倒是给了我一个大好机会。

<!--more-->

``` cpp

#pragma once
#include <iostream>
#include <Windows.h>

class CardManager {

public:
	enum DATA_T {
		PUBLISHER, 
		CARD_ID, 
		USER_NAME, 
	};

private:
	const short PUBLISHER_ADDR = 0x30;
	const short PUBLISHER_LEN = 0x10;
	const short CARD_ID_ADDR =
		PUBLISHER_ADDR + PUBLISHER_LEN;
	const short CARD_ID_LEN = 0x10;
	const short USER_NAME_ADDR =
		CARD_ID_ADDR + CARD_ID_LEN;
	const short USER_NAME_LEN = 0x10;
	const short BALANCE_ADDR =
		USER_NAME_ADDR + USER_NAME_LEN;
	const short BALANCE_LEN = 0x04; //sizeof(float)
	const short BALANCE_BUF_ADDR =
		BALANCE_ADDR + BALANCE_LEN;
	const short BALANCE_BUF_LEN = BALANCE_LEN;

	HANDLE m_icdev;
	bool m_passwdChecked;
	void(*noPasswdFunc)(void);
	void(*notInitFunc)(void);

	inline bool passWordConfirm()
	{
		if (noPasswdFunc && !m_passwdChecked) {
			noPasswdFunc();
		}
		return m_passwdChecked;
	}

	inline bool initConfirm()
	{
		if (notInitFunc && !m_icdev) {
			notInitFunc();
		}
		return m_icdev != 0;
	}
	bool writeBalance(float num);
	bool writeInfo(DATA_T info_type, 
				   const std::string& data);
	float getBuffer();
	bool writeBuffer(float balance);

	static unsigned char *float2bytes(float num);
	static float bytes2float(unsigned char* bytes);
public:
	CardManager();
	virtual ~CardManager();

	inline bool isInited()
	{
		return m_icdev != 0;
	}

	inline void setNoPasswdCallBack(void(*callBack)(void))
	{
		noPasswdFunc = callBack;
	}

	inline void setNotInitCallBack(void(*callback)(void))
	{
		notInitFunc = callback;
	}

	/*
	return 0 for ok
	1 for init device error
	2 for no card
	*/
	int init(int port,  long baud);

	bool disConnect();
	int getInfo(DATA_T data_type,  std::string& out);
	bool checkPassWd(const unsigned char* key);

	/*
	return 0 for ok
	*/
	int release(float initialBalance);

	/*
	return 0 for ok
	*/
	int consume(float costs);

	float getBalance();
	int charge(float amount);
};
```
