#pragma once


class VizRailException
{
public:
	explicit VizRailException(const AcString& message)
		: _message(message)
	{
	}

	explicit VizRailException(const wchar_t* message)
		: _message(message)
	{
	}

	[[nodiscard]] const AcString& GetMessage() const
	{
		return _message;
	}

private:
	AcString _message;
};

class ProjectDirException : public VizRailException
{
public:
	explicit ProjectDirException(const AcString& message)
		: VizRailException(message)
	{
	}

	explicit ProjectDirException(const wchar_t* message)
		: VizRailException(message)
	{
	}
};
