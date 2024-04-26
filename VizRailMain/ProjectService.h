#pragma once
#include "Exception.h"


class ProjectService
{
public:
	static AcString GetProjectDir()
	{
		if (_projectDir.isEmpty())
		{
			OpenProject();
		}
		return _projectDir;
	}

	static void OpenProject();

	static AcString GetMdbFilePath();

private:
	inline static AcString _projectDir = L"";
};
