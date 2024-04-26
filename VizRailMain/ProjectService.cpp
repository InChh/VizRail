#include "StdAfx.h"
#include "ProjectService.h"

void ProjectService::OpenProject()
{
	CAcModuleResourceOverride resOverride;
	if (CAcUiFileDialog dlg(TRUE, L"MDB", nullptr, OFN_HIDEREADONLY | OFN_OVERWRITEPROMPT, L"*.MDB|*.mdb", nullptr); dlg
		.DoModal() == IDOK)
	{
		const CString path = dlg.GetPathName();
		const int index = path.Find(L"DATA");
		if (index == -1)
		{
			throw ProjectDirException(L"请选择处于正确项目路径下的方案MDB");
		}
		const CString dir = path.Left(index - 1);
		_projectDir = dir;
	}
}

AcString ProjectService::GetMdbFilePath()
{
	CAcModuleResourceOverride resOverride;
	if (CAcUiFileDialog dlg(TRUE, L"MDB", nullptr, OFN_HIDEREADONLY | OFN_OVERWRITEPROMPT, L"*.MDB|*.mdb", nullptr); dlg
		.DoModal() == IDOK)
	{
		const CString path = dlg.GetPathName();
		if (const int index = path.Find(L"DATA"); index == -1)
		{
			throw ProjectDirException(L"请选择处于正确项目路径下的方案MDB");
		}
		return path;
	}
	return L"";
}
