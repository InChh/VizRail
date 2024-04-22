#pragma once
#include <string>


std::wstring string2wstring(std::string str);


class NotInLineException : public std::exception
{
public:
	NotInLineException(const std::wstring& message) : _message(message)
	{
	}

	[[nodiscard]] const std::wstring& GetMessage() const
	{
		return _message;
	}

	[[nodiscard]] const char* what() const noexcept override
	{
		return "NotInLineException";
	}

private:
	std::wstring _message;
};
