#include "DatabaseUtils.h"

#include <filesystem>
#include <format>

#include "Exceptions.h"

inline void TESTHR(HRESULT x) { if FAILED(x) _com_issue_error(x); };

AccessRecordset::AccessRecordset(const _RecordsetPtr& pRecordSet): _pRecordset(pRecordSet)
{
}

AccessRecordset::~AccessRecordset()
{
	if (_pRecordset)
	{
		if (_pRecordset->State)
		{
			_pRecordset->Close();
			_pRecordset = nullptr;
		}
	}
}

bool AccessRecordset::MoveNext() const
{
	const HRESULT hr = _pRecordset->MoveNext();
	if (FAILED(hr))
	{
		return false;
	}
	return true;
}

bool AccessRecordset::IsEof() const
{
	return _pRecordset->EndOfFile == VARIANT_TRUE;
}

AccessConnection::AccessConnection(const std::wstring& dbFilePath): AccessConnection()
{
	Open(dbFilePath);
}

AccessConnection::AccessConnection()
{
	// Initialize COM
	if (const HRESULT hr = CoInitialize(nullptr); FAILED(hr))
	{
		throw AccessDatabaseException(L"初始化COM组件失败");
	}
}

AccessConnection::~AccessConnection()
{
	Close();
	CoUninitialize();
}

void AccessConnection::CreateDatabase(const std::wstring& dbFilePath)
{
	try
	{
		// Create database
		_CatalogPtr pCatalog;
		TESTHR(pCatalog.CreateInstance(__uuidof(Catalog)));
		pCatalog->Create((L"Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + dbFilePath).c_str());
		_TablePtr pTable;
		TESTHR(pTable.CreateInstance(_uuidof(Table)));
		pTable->PutName(L"曲线表");
		pTable->Columns->Append(L"交点号", ::adVarWChar, 10);
		pTable->Columns->Append(L"坐标N", ::adDouble, 0);
		pTable->Columns->Append(L"坐标E", ::adDouble, 0);
		pTable->Columns->Append(L"偏角", ::adDouble, 0);
		pTable->Columns->Append(L"曲线半径", ::adDouble, 0);
		pTable->Columns->Append(L"前缓和曲线", ::adDouble, 0);
		pTable->Columns->Append(L"后缓和曲线", ::adDouble, 0);
		pTable->Columns->Append(L"前切线长", ::adDouble, 0);
		pTable->Columns->Append(L"后切线长", ::adDouble, 0);
		pTable->Columns->Append(L"曲线长", ::adDouble, 0);
		pTable->Columns->Append(L"夹直线长", ::adDouble, 0);
		pTable->Columns->Append(L"起点里程冠号", ::adVarWChar, 10);
		pTable->Columns->Append(L"起点里程", ::adDouble, 0);
		pTable->Columns->Append(L"终点里程冠号", ::adVarWChar, 10);
		pTable->Columns->Append(L"终点里程", ::adDouble, 0);
		pCatalog->Tables->Append(_variant_t((IDispatch*)pTable));
	}
	catch (_com_error& e)
	{
		throw AccessDatabaseException(std::format(L"创建数据库失败:{}({})", std::wstring(e.Description()),
		                                          std::wstring(e.Source())));
	}
}

void AccessConnection::Open(const std::wstring& dbFilePath)
{
	// 检查文件是否存在
	if (!std::filesystem::exists(dbFilePath))
	{
		// 创建数据库
		CreateDatabase(dbFilePath);
	}
	try
	{
		// Create connection
		if (HRESULT hr = _pConnection.CreateInstance(__uuidof(Connection)); SUCCEEDED(hr))
		{
			// Open connection
			const std::wstring connStr = std::format(L"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={}", dbFilePath);
			_pConnection->CursorLocation = adUseClient;
			hr = _pConnection->Open((_bstr_t)connStr.c_str(), "", "", adModeUnknown);
		}
	}
	catch (_com_error& e)
	{
		_isOpen = false;

		throw AccessDatabaseException(std::format(L"数据库连接失败:{}", std::wstring(e.Description())));
	}

	_isOpen = true;
}

void AccessConnection::Close()
{
	if (_isOpen)
	{
		_pConnection->Close();
		_isOpen = false;
	}
}

AccessRecordset AccessConnection::Execute(const std::wstring& sql)
{
	if (!_isOpen)
	{
		throw AccessDatabaseException(L"未连接到数据库");
	}
	try
	{
		_RecordsetPtr pRecordset;
		if (const HRESULT hr = pRecordset.CreateInstance(__uuidof(Recordset)); SUCCEEDED(hr))
		{
			if (pRecordset->State)
			{
				pRecordset->Close();
			}
			pRecordset->Open(sql.c_str(), _pConnection.GetInterfacePtr(), adOpenDynamic, adLockOptimistic,
			                 adCmdText);
			return AccessRecordset(pRecordset);
		}
	}
	catch (_com_error& e)
	{
		Close();
		throw AccessDatabaseException(std::format(L"执行SQL语句失败:{}", std::wstring(e.Description())));
	}
	throw AccessDatabaseException(L"执行SQL语句失败");
}
