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

	static void OpenProject()
	{
		CAcModuleResourceOverride resOverride;
		if (CAcUiFileDialog dlg(TRUE, L"MDB", nullptr, OFN_HIDEREADONLY | OFN_OVERWRITEPROMPT, L"*.MDB|*.mdb", nullptr); dlg.DoModal() == IDOK)
		{
			const CString folderPath = dlg.GetPathName();
			const int index = folderPath.Find(L"DATA");
			if (index == -1)
			{
				throw ProjectDirException(L"请选择处于正确项目路径下的方案MDB");
			}
			const CString dir = folderPath.Left(index - 1);
			_projectDir = dir;
		}
	}

private:
	inline static AcString _projectDir = L"";
};
