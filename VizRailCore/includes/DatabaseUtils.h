#pragma once
#include <string>

#import "c:\\program files\\common files\\system\\ado\\msado15.dll" named_guids rename_namespace("ADOCG") rename("EOF", "EndOfFile") rename("BOF","FirstOfFile") rename("EOS","EndOfStream")
using namespace ADOCG;

class AccessRecordset
{
public:
	explicit AccessRecordset(const _RecordsetPtr& pRecordSet);
	~AccessRecordset();

	bool MoveNext() const;
	bool IsEof() const;

	_RecordsetPtr operator->()
	{
		return _pRecordset;
	}

private:
	_RecordsetPtr _pRecordset = nullptr;
};


class AccessConnection
{
public:
	explicit AccessConnection(const std::wstring& dbFilePath);
	AccessConnection();
	~AccessConnection();

	void Open(const std::wstring& dbFilePath);
	void Close();
	AccessRecordset Execute(const std::wstring& sql);

private:
	bool _isOpen = false;
	_ConnectionPtr _pConnection = nullptr;
};


