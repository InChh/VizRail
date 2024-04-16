#pragma once

class AccessDatabaseException final : public std::exception
{
public:
	explicit AccessDatabaseException(const std::wstring& message) : _message(message)
	{
	}

	[[nodiscard]] const char* what() const override
	{
		return "Access database exception";
	}

	[[nodiscard]] const std::wstring& GetMessage() const
	{
		return _message;
	}

private:
	std::wstring _message;
};
