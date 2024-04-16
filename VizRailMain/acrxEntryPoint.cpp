#include "stdafx.h"
// Simple acrxEntryPoint code. Normally intialization and cleanup
// (such as registering and removing commands) should be done here.
//
#pragma comment(linker, "/export:acrxGetApiVersion,PRIVATE")
#pragma comment(linker, "/export:acrxEntryPoint,PRIVATE")


void initApp();
void unloadApp();

extern "C" AcRx::AppRetCode
acrxEntryPoint(AcRx::AppMsgCode msg, void* appId)
{
	switch (msg)
	{
	case AcRx::kInitAppMsg:
		// Allow application to be unloaded
		// Without this statement, AutoCAD will
		// not allow the application to be unloaded
		// except on AutoCAD exit.
		//
		acrxUnlockApplication(appId);
	// Register application as MDI aware. 
	// Without this statement, AutoCAD will
	// switch to SDI mode when loading the
	// application.
	//
		initApp();
		acrxRegisterAppMDIAware(appId);
		acutPrintf(L"\nExample Application Loaded");
		break;
	case AcRx::kUnloadAppMsg:
		acutPrintf(L"\nExample Application Unloaded");
		unloadApp();
		break;
	}
	return AcRx::kRetOK;
}

void testCurve()
{
	acutPrintf(L"\nTest Curve");
}

void
initApp()
{
	acedRegCmds->addCommand(L"ASDK_VIZRAIL_COMMANDS",
	                        L"ASDK_TESTCURVE", L"CREATE", ACRX_CMD_MODAL,
	                        testCurve);
}

// The cleanup function called from the acrxEntryPoint() 
// function during the kUnloadAppMsg case removes this application's
// command set from the command stack and removes this application's
// custom classes from the ACRX runtime class hierarchy.
//
void
unloadApp()
{
	acedRegCmds->removeGroup(L"ASDK_VIZRAIL_COMMANDS");
	// Remove the AsdkMyClass class from the ACRX runtime
	// class hierarchy. If this is done while the database is
	// still active, it should cause all objects of class
	// AsdkMyClass to be turned into proxies.
	//
}
