// (C) Copyright 2002-2012 by Autodesk, Inc. 
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//
// Use, duplication, or disclosure by the U.S. Government is subject to 
// restrictions set forth in FAR 52.227-19 (Commercial Computer
// Software - Restricted Rights) and DFAR 252.227-7013(c)(1)(ii)
// (Rights in Technical Data and Computer Software), as applicable.
//

//-----------------------------------------------------------------------------
//----- acrxEntryPoint.cpp
//-----------------------------------------------------------------------------
#include "StdAfx.h"

#include <format>

#include "HorizontalAlignmentEntity.h"
#include "ProjectService.h"
#include "resource.h"
#include "Utils.h"
#include "../VizRailCore/includes/DatabaseUtils.h"
#include "../VizRailCore/includes/Exceptions.h"
#include "../VizRailCore/includes/Jd.h"

//-----------------------------------------------------------------------------
#define szRDS _RXST("ADSK")

//-----------------------------------------------------------------------------
//----- ObjectARX EntryPoint
class CVizRailMainApp : public AcRxArxApp
{
public:
	CVizRailMainApp() : AcRxArxApp()
	{
	}

	virtual AcRx::AppRetCode On_kInitAppMsg(void* pkt)
	{
		// TODO: Load dependencies here

		// You *must* call On_kInitAppMsg here
		AcRx::AppRetCode retCode = AcRxArxApp::On_kInitAppMsg(pkt);

		// TODO: Add your initialization code here
		HorizontalAlignmentEntity::rxInit();

		if (!acrxServiceIsRegistered(L"HorizontalAlignmentEntity"))
		{
			acrxRegisterService(L"HorizontalAlignmentEntity");
		}

		acrxBuildClassHierarchy();

		return (retCode);
	}

	virtual AcRx::AppRetCode On_kUnloadAppMsg(void* pkt)
	{
		// TODO: Add your code here

		// You *must* call On_kUnloadAppMsg here
		AcRx::AppRetCode retCode = AcRxArxApp::On_kUnloadAppMsg(pkt);

		// TODO: Unload dependencies here
		AcRxObject* obj = acrxServiceDictionary->remove(L"HorizontalAlignmentEntity");
		if (obj != nullptr)
			delete obj;

		deleteAcRxClass(HorizontalAlignmentEntity::desc());

		acrxBuildClassHierarchy();

		return (retCode);
	}

	virtual void RegisterServerComponents()
	{
	}

	// The ACED_ARXCOMMAND_ENTRY_AUTO macro can be applied to any static member 
	// function of the CVizRailMainApp class.
	// The function should take no arguments and return nothing.
	//
	// NOTE: ACED_ARXCOMMAND_ENTRY_AUTO has overloads where you can provide resourceid and
	// have arguments to define context and command mechanism.

	// ACED_ARXCOMMAND_ENTRY_AUTO(classname, group, globCmd, locCmd, cmdFlags, UIContext)
	// ACED_ARXCOMMAND_ENTRYBYID_AUTO(classname, group, globCmd, locCmdId, cmdFlags, UIContext)
	// only differs that it creates a localized name using a string in the resource file
	//   locCmdId - resource ID for localized command

	// Modal Command with localized name
	// ACED_ARXCOMMAND_ENTRY_AUTO(CVizRailMainApp, ADSKMyGroup, MyCommand, MyCommandLocal, ACRX_CMD_MODAL)
	static void ADSKMyGroupHello()
	{
		AcString name;
		acedGetString(0, L"please input your name:", name);
		acutPrintf(L"\nHello,%s", name);
	}

	static void ADSKVizRailGroupOpenProject()
	{
		ProjectService::OpenProject();
	}

	static void ADSKVizRailGroupImportHorizontal()
	{
		try
		{
			std::vector<Jd> jds;
			AcString path = ProjectService::GetMdbFilePath();
			if (path == L"")
			{
				return;
			}
			AccessConnection conn(path.constPtr());
			auto pRecordSet = conn.Execute(L"SELECT * FROM 曲线表");
			jds.clear();
			while (!pRecordSet.IsEof())
			{
				auto vJdH = pRecordSet->GetCollect(L"交点号");
				auto vN = pRecordSet->GetCollect(L"坐标N");
				auto vE = pRecordSet->GetCollect(L"坐标E");
				auto va = pRecordSet->GetCollect(L"偏角");
				auto vR = pRecordSet->GetCollect(L"曲线半径");
				auto vLs = pRecordSet->GetCollect(L"前缓和曲线");
				auto vTH = pRecordSet->GetCollect(L"前切线长");
				auto vLH = pRecordSet->GetCollect(L"曲线长");
				auto vLJzx = pRecordSet->GetCollect(L"夹直线长");
				auto vStartMileage = pRecordSet->GetCollect(L"起点里程");
				auto vEndMileage = pRecordSet->GetCollect(L"终点里程");

				jds.emplace_back(vJdH,
				                 vN,
				                 vE,
				                 va,
				                 vR,
				                 vLs,
				                 vTH,
				                 vLH,
				                 vLJzx,
				                 vStartMileage,
				                 vEndMileage
				);
				pRecordSet.MoveNext();
			}
			const auto pEntity = new HorizontalAlignmentEntity(L"方案1", jds);
			AcDbObjectId id;
			AcDbBlockTable* pBlockTable;
			acdbHostApplicationServices()->workingDatabase()->getSymbolTable(pBlockTable, AcDb::kForRead);
			AcDbBlockTableRecord* pBlockTableRecord;
			pBlockTable->getAt(ACDB_MODEL_SPACE, pBlockTableRecord, AcDb::kForWrite);
			pBlockTable->close();
			const auto ret = pBlockTableRecord->appendAcDbEntity(id, pEntity);
			pBlockTableRecord->close();
			SetView({jds[0].E, jds[0].N}, {jds[jds.size() - 1].E, jds[jds.size() - 1].N}, 1);
			pEntity->close();
		}
		catch (AccessDatabaseException& e)
		{
			acutPrintf(L"%s", e.GetMsg().c_str());
		}
		catch (std::exception& e)
		{
			acutPrintf(L"%s", e.what());
		}
		catch (...)
		{
			acutPrintf(L"未知错误");
		}
	}

	static void ADSKVizRailGroupSaveHorizontal()
	{
		// 选择平面实体
		ads_name en;
		ads_point pt;
		AcDbObjectId objId;
		AcDbEntity* pEntity;
		if (acedEntSel(L"\n选择平面实体:", en, pt) != RTNORM)
		{
			return;
		}
		// 判断实体类型
		if (acdbGetObjectId(objId, en) != Acad::eOk)
		{
			return;
		}
		if (acdbOpenAcDbEntity(pEntity, objId, AcDb::kForRead) != Acad::eOk)
		{
			return;
		}
		if (pEntity->isKindOf(HorizontalAlignmentEntity::desc()) == false)
		{
			acutPrintf(L"请选择平面实体");
			pEntity->close();
			return;
		}

		try
		{
			const AcString path = ProjectService::GetMdbFilePath();
			AccessConnection conn(path.constPtr());
			const auto pHAEntity = static_cast<HorizontalAlignmentEntity*>(pEntity);
			const auto jds = pHAEntity->HorizontalAlignment().GetJds();
			conn.Execute(L"DELETE * FROM 曲线表");
			for (const auto& jd : jds)
			{
				conn.Execute(std::format(
					L"INSERT INTO 曲线表(交点号,坐标N,坐标E,偏角,曲线半径,前缓和曲线,后缓和曲线,前切线长,后切线长,曲线长,夹直线长,起点里程冠号,起点里程,终点里程冠号,终点里程) "
					"VALUES("
					"'{}',{},{},{},{},{},{},{},{},{},{},'AK',{},'AK',{})"
					, jd.JdH, jd.N, jd.E, jd.Angle, jd.R, jd.Ls, jd.Ls, jd.TH, jd.TH, jd.LH, jd.LJzx, jd.StartMileage,
					jd.EndMileage));
			}
		}
		catch (AccessDatabaseException& e)
		{
			acutPrintf(L"%s", e.GetMsg().c_str());
		}
		catch (std::exception& e)
		{
			acutPrintf(L"%s", e.what());
		}
		catch (...)
		{
			acutPrintf(L"未知错误");
		}
		pEntity->close();
	}

	static void ADSKVizRailGroupAddJd()
	{
	}

	static void ADSKVizRailGroupRemoveJd()
	{
	}
};

//-----------------------------------------------------------------------------
IMPLEMENT_ARX_ENTRYPOINT(CVizRailMainApp)

ACED_ARXCOMMAND_ENTRY_AUTO(CVizRailMainApp, ADSKMyGroup, Hello, Hello, ACRX_CMD_MODAL, NULL)
ACED_ARXCOMMAND_ENTRY_AUTO(CVizRailMainApp, ADSKVizRailGroup, OpenProject, OpenProject, ACRX_CMD_MODAL, NULL)
ACED_ARXCOMMAND_ENTRY_AUTO(CVizRailMainApp, ADSKVizRailGroup, ImportHorizontal, ImportHorizontal, ACRX_CMD_MODAL, NULL)
ACED_ARXCOMMAND_ENTRY_AUTO(CVizRailMainApp, ADSKVizRailGroup, SaveHorizontal, SaveHorizontal, ACRX_CMD_MODAL, NULL)
