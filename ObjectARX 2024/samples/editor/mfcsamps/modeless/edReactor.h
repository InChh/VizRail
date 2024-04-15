//////////////////////////////////////////////////////////////////////////////
//
//  Copyright 2023 Autodesk, Inc.  All rights reserved.
//
//  Use of this software is subject to the terms of the Autodesk license 
//  agreement provided at the time of installation or download, or which 
//  otherwise accompanies this software in either electronic or hard copy form.   
//
//////////////////////////////////////////////////////////////////////////////
//
class CEdReactor : public AcEditorReactor
{
public:
    virtual void commandEnded(const TCHAR *cmdStr);
	virtual void commandWillStart(const TCHAR *cmdStr);
};