#pragma once

#import "C:\\Program Files\\Common Files\\System\\ado\\msado15.dll" no_namespace rename("EOF","adoEOF")


class AccessRecordset
{
public:
	AccessRecordset(_ConnectionPtr pConnection);
	~AccessRecordset();

	bool MoveNext();
	bool IsEOF();
	std::string GetString(const std::wstring& fieldName);
	int GetInt(const std::wstring& fieldName);
	double GetDouble(const std::wstring& fieldName);

private:
	_RecordsetPtr _pRecordset = nullptr;
};


class AccessConnection
{
public:
	AccessConnection(const std::wstring& filePath);
	~AccessConnection();

	bool Open(const std::wstring& filename);
	void Close();
	AccessRecordset Execute(const std::wstring& sql);

private:
	_ConnectionPtr _pConnection = nullptr;
};


