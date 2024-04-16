// VizRailUiDlg.cpp: 实现文件
//

#include "pch.h"
#include "framework.h"
#include "VizRailUi.h"
#include "VizRailUiDlg.h"

#include <sstream>
#include "afxdialogex.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif
#include <vector>

#include "CurveTable.h"
#include "../VizRailCore/includes/Curve.h"
#include "../VizRailCore/includes/DatabaseUtils.h"
#include "../VizRailCore/includes/Exceptions.h"


// 用于应用程序“关于”菜单项的 CAboutDlg 对话框

class CAboutDlg : public CDialogEx
{
public:
	CAboutDlg();

	// 对话框数据
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_ABOUTBOX };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX); // DDX/DDV 支持

	// 实现
protected:
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialogEx(IDD_ABOUTBOX)
{
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialogEx)
END_MESSAGE_MAP()


// CVizRailUiDlg 对话框


CVizRailUiDlg::CVizRailUiDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_VIZRAILUI_DIALOG, pParent)
{
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
}

void CVizRailUiDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
	//  DDX_Text(pDX, IDC_EDIT1, _dbFilePath);
	DDX_Control(pDX, IDC_EDIT1, _dbPathEdit);
}

BEGIN_MESSAGE_MAP(CVizRailUiDlg, CDialogEx)
	ON_WM_SYSCOMMAND()
	ON_WM_PAINT()
	ON_WM_QUERYDRAGICON()
	ON_BN_CLICKED(IDC_BUTTON1, &CVizRailUiDlg::OnBnClickedButton1)
	ON_BN_CLICKED(IDC_BUTTON2, &CVizRailUiDlg::OnBnClickedButton2)
END_MESSAGE_MAP()


// CVizRailUiDlg 消息处理程序

BOOL CVizRailUiDlg::OnInitDialog()
{
	CDialogEx::OnInitDialog();

	// 将“关于...”菜单项添加到系统菜单中。

	// IDM_ABOUTBOX 必须在系统命令范围内。
	ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
	ASSERT(IDM_ABOUTBOX < 0xF000);

	CMenu* pSysMenu = GetSystemMenu(FALSE);
	if (pSysMenu != nullptr)
	{
		BOOL bNameValid;
		CString strAboutMenu;
		bNameValid = strAboutMenu.LoadString(IDS_ABOUTBOX);
		ASSERT(bNameValid);
		if (!strAboutMenu.IsEmpty())
		{
			pSysMenu->AppendMenu(MF_SEPARATOR);
			pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
		}
	}

	// 设置此对话框的图标。  当应用程序主窗口不是对话框时，框架将自动
	//  执行此操作
	SetIcon(m_hIcon, TRUE); // 设置大图标
	SetIcon(m_hIcon, FALSE); // 设置小图标

	ShowWindow(SW_MAXIMIZE);

	ShowWindow(SW_MINIMIZE);

	// TODO: 在此添加额外的初始化代码

	return TRUE; // 除非将焦点设置到控件，否则返回 TRUE
}

void CVizRailUiDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_ABOUTBOX)
	{
		CAboutDlg dlgAbout;
		dlgAbout.DoModal();
	}
	else
	{
		CDialogEx::OnSysCommand(nID, lParam);
	}
}

// 如果向对话框添加最小化按钮，则需要下面的代码
//  来绘制该图标。  对于使用文档/视图模型的 MFC 应用程序，
//  这将由框架自动完成。

void CVizRailUiDlg::OnPaint()
{
	if (IsIconic())
	{
		CPaintDC dc(this); // 用于绘制的设备上下文

		SendMessage(WM_ICONERASEBKGND, reinterpret_cast<WPARAM>(dc.GetSafeHdc()), 0);

		// 使图标在工作区矩形中居中
		int cxIcon = GetSystemMetrics(SM_CXICON);
		int cyIcon = GetSystemMetrics(SM_CYICON);
		CRect rect;
		GetClientRect(&rect);
		int x = (rect.Width() - cxIcon + 1) / 2;
		int y = (rect.Height() - cyIcon + 1) / 2;

		// 绘制图标
		dc.DrawIcon(x, y, m_hIcon);
	}
	else
	{
		CDialogEx::OnPaint();
	}
}

//当用户拖动最小化窗口时系统调用此函数取得光标
//显示。
HCURSOR CVizRailUiDlg::OnQueryDragIcon()
{
	return static_cast<HCURSOR>(m_hIcon);
}


void CVizRailUiDlg::OnBnClickedButton1()
{
	// 打开文件选择对话框
	CFileDialog dlg(TRUE, L"MDB", nullptr, OFN_HIDEREADONLY | OFN_OVERWRITEPROMPT, L"*.MDB|*.mdb", this);
	if (dlg.DoModal() == IDOK)
	{
		const CString path = dlg.GetPathName();
		_dbPathEdit.SetWindowText(path);
	}
}


void CVizRailUiDlg::OnBnClickedButton2()
{
	std::wstringstream ss;
	ss.precision(6);
	ss.setf(std::ios::fixed);
	CString path;
	_dbPathEdit.GetWindowTextW(path);
	try
	{
		AccessConnection conn(path.GetString());
		auto pRecordSet = conn.Execute(L"SELECT * FROM 曲线表");
		std::vector<CurveTable> curveTableData;
		while (!pRecordSet.IsEof())
		{
			auto vJdH = pRecordSet->GetCollect(L"交点号");
			auto vN = pRecordSet->GetCollect(L"坐标N");
			auto vE = pRecordSet->GetCollect(L"坐标E");
			auto va = pRecordSet->GetCollect(L"偏角");
			auto vR = pRecordSet->GetCollect(L"曲线半径");
			auto vLs = pRecordSet->GetCollect(L"前缓和曲线");

			CurveTable c;
			c.N = vN;
			c.E = vE;
			c.SteeringAngle = va;
			c.R = vR;
			c.Ls = vLs;
			c.JdH = vJdH;
			curveTableData.push_back(c);

			pRecordSet.MoveNext();
		}

		for (const auto& c : curveTableData)
		{
			ss << L"坐标N: " << c.N << "\t"
				<< L"坐标E: " << c.E << "\t"
				<< L"曲线半径: " << c.R << "\t"
				<< L"缓长: " << c.Ls << "\n";
		}
		if (curveTableData.size() > 2)
		{
			for (size_t i = 1; i < curveTableData.size() - 1; ++i)
			{
				VizRailCore::Point2D jd1 = {curveTableData[i - 1].N, curveTableData[i - 1].E};
				VizRailCore::Point2D jd2 = {curveTableData[i].N, curveTableData[i].E};
				VizRailCore::Point2D jd3 = {curveTableData[i + 1].N, curveTableData[i + 1].E};
				const double r = curveTableData[i].R;
				const double ls = curveTableData[i].Ls;
				VizRailCore::Curve curve(jd1, jd2, jd3, r, ls);
				ss << L"切线长：" << curve.T_H() << "\t"
					<< L"曲线长：" << curve.L_H() << "\t"
					<< L"转角：" << curve.Alpha().Degree() << "\t"
					<< L"ZH点：" << curve.K(VizRailCore::SpecialPoint::ZH, 4567.1 + 3000 * i).Value() << "\t"
					<< L"HY点：" << curve.K(VizRailCore::SpecialPoint::HY, 4567.1 + 3000 * i).Value() << "\t"
					<< L"QZ点：" << curve.K(VizRailCore::SpecialPoint::QZ, 4567.1 + 3000 * i).Value() << "\t"
					<< L"YH点：" << curve.K(VizRailCore::SpecialPoint::YH, 4567.1 + 3000 * i).Value() << "\t"
					<< L"HZ点：" << curve.K(VizRailCore::SpecialPoint::HZ, 4567.1 + 3000 * i).Value() << "\n";
			}
		}
		auto text = ss.str();
		MessageBoxW(text.c_str());
	}
	catch (AccessDatabaseException& e)
	{
		MessageBoxW(e.GetMessageW().c_str());
	}
}
