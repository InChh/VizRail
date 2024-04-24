#pragma once
#include "afxdialogex.h"
#include "Jd.h"


// EditJdDlg 对话框

class EditJdDlg : public CDialogEx
{
	DECLARE_DYNAMIC(EditJdDlg)

public:
	EditJdDlg(CWnd* pParent = nullptr); // 标准构造函数
	EditJdDlg(const Jd& jd, CWnd* pParent = nullptr);
	virtual ~EditJdDlg();

	// 对话框数据
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_EDIT_JD_DLG };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX); // DDX/DDV 支持

	DECLARE_MESSAGE_MAP()

public:
	CEdit _nCoordEdit;
	CEdit _eCoordEdit;
	CEdit _rEdit;
	CEdit _lsEdit;
	Jd _jdData;
	afx_msg void OnBnClickedOk();
	virtual BOOL OnInitDialog();
};
