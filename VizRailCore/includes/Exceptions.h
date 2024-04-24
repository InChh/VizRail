#pragma once

class VizRailCoreException
{
public:
	explicit VizRailCoreException(const std::wstring& message): _message(message)
	{
	}

	virtual ~VizRailCoreException() = default;

	[[nodiscard]] virtual const std::wstring& GetMessage() const
	{
		return _message;
	}

private:
	std::wstring _message;
};

class AccessDatabaseException final : public VizRailCoreException
{
public:
	explicit AccessDatabaseException(const std::wstring& message) : VizRailCoreException(message)
	{
	}
};

class NotInLineException final : public VizRailCoreException
{
public:
	explicit NotInLineException(const std::wstring& message) : VizRailCoreException(message)
	{
	}
};
