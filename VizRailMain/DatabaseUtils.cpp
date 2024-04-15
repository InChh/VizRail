#include "stdafx.h"
#include "DatabaseUtils.h"

#include <format>

AccessConnection::AccessConnection(const std::wstring& filePath)
{
	// Initialize COM
		CoInitialize(NULL);
		Open(filePath);

}

bool AccessConnection::Open(const std::wstring& filePath)
{
}
