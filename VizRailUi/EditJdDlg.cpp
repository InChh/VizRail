// EditJdDlg.cpp: 实现文件
//

#include "pch.h"
#include "VizRailUi.h"
#include "afxdialogex.h"
#include "EditJdDlg.h"

#include <format>
#include <string>


// EditJdDlg 对话框

IMPLEMENT_DYNAMIC(EditJdDlg, CDialogEx)

EditJdDlg::EditJdDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_EDIT_JD_DLG, pParent)
{
}

EditJdDlg::EditJdDlg(const Jd& jd, CWnd* pParent): CDialogEx(IDD_EDIT_JD_DLG, pParent), _jdData(jd)
{
}

EditJdDlg::~EditJdDlg()
{
}

void EditJdDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
	DDX_Control(pDX, IDC_EDIT_N_COORD, _nCoordEdit);
	DDX_Control(pDX, IDC_EDIT_E_COORD, _eCoordEdit);
	DDX_Control(pDX, IDC_EDIT_RADIUS, _rEdit);
	DDX_Control(pDX, IDC_EDIT_LS, _lsEdit);
}


BEGIN_MESSAGE_MAP(EditJdDlg, CDialogEx)
	ON_BN_CLICKED(IDOK, &EditJdDlg::OnBnClickedOk)
END_MESSAGE_MAP()


// EditJdDlg 消息处理程序


void EditJdDlg::OnBnClickedOk()
{
	CString strN;
	_nCoordEdit.GetWindowTextW(strN);
	CString strE;
	_eCoordEdit.GetWindowTextW(strE);
	CString strR;
	_rEdit.GetWindowTextW(strR);
	CString strLs;
	_lsEdit.GetWindowTextW(strLs);
	try
	{
		_jdData.N = std::stod(strN.GetString());
		_jdData.E = std::stod(strE.GetString());
		_jdData.R = std::stod(strR.GetString());
		_jdData.Ls = std::stod(strLs.GetString());
		CDialogEx::OnOK();
	}
	catch (const std::exception&)
	{
		MessageBox(L"输入数据格式错误");
	}
}


BOOL EditJdDlg::OnInitDialog()
{
	CDialogEx::OnInitDialog();

	_nCoordEdit.SetWindowTextW(std::format(L"{}", _jdData.N).c_str());
	_eCoordEdit.SetWindowTextW(std::format(L"{}", _jdData.E).c_str());
	_rEdit.SetWindowTextW(std::format(L"{}", _jdData.R).c_str());
	_lsEdit.SetWindowTextW(std::format(L"{}", _jdData.Ls).c_str());

	return TRUE; // return TRUE unless you set the focus to a control
	// 异常: OCX 属性页应返回 FALSE
}
