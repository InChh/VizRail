// VizRailUiDlg.cpp: 实现文件
//

#include "pch.h"
#include "framework.h"
#include "VizRailUi.h"
#include "VizRailUiDlg.h"

#include <sstream>
#include <fstream>
#include "afxdialogex.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif
#include <format>
#include <vector>

#include "EditJdDlg.h"
#include "Jd.h"
#include "Utils.h"
#include "../VizRailCore/includes/Curve.h"
#include "../VizRailCore/includes/DatabaseUtils.h"
#include "../VizRailCore/includes/Exceptions.h"
#include "../VizRailCore/includes/IntermediateLine.h"


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
	//  DDX_Control(pDX, IDC_LIST1, _jdListBox);
	DDX_Control(pDX, IDC_LIST2, _jdListCtrl);
	DDX_Control(pDX, IDC_EDIT2, _mileageInput);
	DDX_Control(pDX, IDC_EDIT3, _coordinateOutput);
	//  DDX_Control(pDX, IDC_CUSTOM2, _view);
}

BEGIN_MESSAGE_MAP(CVizRailUiDlg, CDialogEx)
	ON_WM_SYSCOMMAND()
	ON_WM_PAINT()
	ON_WM_QUERYDRAGICON()
	ON_BN_CLICKED(IDC_BUTTON1, &CVizRailUiDlg::OnBnClickedButton1)
	ON_BN_CLICKED(IDC_BUTTON2, &CVizRailUiDlg::OnBnClickedButton2)
	ON_BN_CLICKED(IDC_BUTTON4, &CVizRailUiDlg::OnBnClickedButton4)
	ON_BN_CLICKED(IDC_BUTTON5, &CVizRailUiDlg::OnBnClickedButton5)
	ON_NOTIFY(NM_DBLCLK, IDC_LIST2, &CVizRailUiDlg::OnNMDblclkList2)
	ON_BN_CLICKED(IDC_BUTTON_REFRESH, &CVizRailUiDlg::OnBnClickedButtonRefresh)
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


	ShowWindow(SW_NORMAL);

	_jdListCtrl.SetExtendedStyle(LVS_EX_FULLROWSELECT | LVS_EX_GRIDLINES);
	_jdListCtrl.InsertColumn(0, L"交点号", LVCFMT_CENTER, 50);
	_jdListCtrl.InsertColumn(1, L"坐标N",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(2, L"坐标E",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(3, L"偏角",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(4, L"曲线半径",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(5, L"缓和曲线",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(6, L"切线长",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(7, L"曲线长",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(8, L"夹直线长",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(9, L"起点里程",LVCFMT_CENTER, 100);
	_jdListCtrl.InsertColumn(10, L"终点里程",LVCFMT_CENTER, 100);

	_mileageInput.SetWindowTextW(L"请输入里程");
	_coordinateOutput.SetWindowTextW(L"坐标");

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


void CVizRailUiDlg::JdsToXys()
{
	if (_jds.size() > 2)
	{
		unsigned int jzxCount = 0;
		unsigned int curveCount = 0;
		size_t i = 1;
		for (; i < _jds.size() - 1; ++i)
		{
			// 遍历交点序列（除了第一个和最后一个交点），分别构造曲线和当前曲线的前一个夹直线
			VizRailCore::Point2D jd1 = {_jds[i - 1].N, _jds[i - 1].E};
			VizRailCore::Point2D jd2 = {_jds[i].N, _jds[i].E};
			VizRailCore::Point2D jd3 = {_jds[i + 1].N, _jds[i + 1].E};
			// 构造曲线对象
			++curveCount;
			const double r = _jds[i].R;
			const double ls = _jds[i].Ls;
			const double startMileage = _jds[i].StartMileage;
			const double th = _jds[i].TH;
			auto curve = std::make_shared<VizRailCore::Curve>(jd1, jd2, jd3, r, ls, startMileage + th);
			_xys.insert_or_assign(std::format(L"曲线{}", curveCount), curve);

			// 构造夹直线对象
			++jzxCount;
			const double jzxStartMileage = _jds[i - 1].EndMileage;
			const double jzxEndMileage = _jds[i].StartMileage;
			VizRailCore::Point2D startPoint;
			if (jzxCount == 1)
			{
				// 第一条夹直线的起点为第一个交点
				startPoint = VizRailCore::Point2D{_jds[i - 1].N, _jds[i - 1].E};
			}
			else
			{
				// 不是第一条夹直线时，起点为上一条曲线的HZ点
				const auto lastCurve = std::dynamic_pointer_cast<VizRailCore::Curve>(
					_xys.at(std::format(L"曲线{}", curveCount - 1)));
				startPoint = lastCurve->SpecialPointCoordinate(VizRailCore::SpecialPoint::HZ);
			}

			// 不是最后一条夹直线时，终点为当前曲线的ZH点
			const VizRailCore::Point2D endPoint = curve->SpecialPointCoordinate(VizRailCore::SpecialPoint::ZH);

			auto jzx = std::make_shared<VizRailCore::IntermediateLine>(
				startPoint, jzxStartMileage, endPoint, jzxEndMileage);
			_xys.insert_or_assign(std::format(L"夹直线{}", jzxCount), jzx);
		}
		// 构造最后一条夹直线，起点为最后一条曲线的HZ点，终点为最后一个交点
		const auto lastCurve = std::dynamic_pointer_cast<VizRailCore::Curve>(
			_xys.at(std::format(L"曲线{}", curveCount)));
		const VizRailCore::Point2D startPoint = lastCurve->SpecialPointCoordinate(VizRailCore::SpecialPoint::HZ);
		const VizRailCore::Point2D endPoint = {_jds[i].N, _jds[i].E};
		auto jzx = std::make_shared<VizRailCore::IntermediateLine>(
			startPoint, _jds[i - 1].EndMileage, endPoint, _jds[i].StartMileage);
		_xys.insert_or_assign(std::format(L"夹直线{}", jzxCount + 1), jzx);
	}
	// 只有两个交点时，只构造一个夹直线对象，起点和终点分别为两个交点
	if (_jds.size() == 2)
	{
		VizRailCore::Point2D jd1 = {_jds[0].N, _jds[0].E};
		const double startMileage = _jds[0].StartMileage;
		VizRailCore::Point2D jd2 = {_jds[1].N, _jds[1].E};
		const double endMileage = _jds[1].EndMileage;
		auto jzx = std::make_shared<VizRailCore::IntermediateLine>(jd1, startMileage, jd2, endMileage);
		_xys.insert_or_assign(L"夹直线1", jzx);
	}
}

void CVizRailUiDlg::GetJds(CString path)
{
	AccessConnection conn(path.GetString());
	auto pRecordSet = conn.Execute(L"SELECT * FROM 曲线表");
	_jds.clear();
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

		_jds.emplace_back(vJdH,
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
}

void CVizRailUiDlg::SetJdListCtrlContent()
{
	_jdListCtrl.DeleteAllItems();
	for (int i = 0; i < _jds.size(); ++i)
	{
		_jdListCtrl.InsertItem(i, std::format(L"{}", _jds[i].JdH).c_str());
		_jdListCtrl.SetItemText(i, 1, std::format(L"{}", _jds[i].N).c_str());
		_jdListCtrl.SetItemText(i, 2, std::format(L"{}", _jds[i].E).c_str());
		_jdListCtrl.SetItemText(i, 3, std::format(L"{}", _jds[i].Angle).c_str());
		_jdListCtrl.SetItemText(i, 4, std::format(L"{}", _jds[i].R).c_str());
		_jdListCtrl.SetItemText(i, 5, std::format(L"{}", _jds[i].Ls).c_str());
		_jdListCtrl.SetItemText(i, 6, std::format(L"{}", _jds[i].TH).c_str());
		_jdListCtrl.SetItemText(i, 7, std::format(L"{}", _jds[i].LH).c_str());
		_jdListCtrl.SetItemText(i, 8, std::format(L"{}", _jds[i].LJzx).c_str());
		_jdListCtrl.SetItemText(i, 9, std::format(L"{}", _jds[i].StartMileage).c_str());
		_jdListCtrl.SetItemText(i, 10, std::format(L"{}", _jds[i].EndMileage).c_str());
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
		GetJds(path);
		SetJdListCtrlContent();
		JdsToXys();
	}
	catch (AccessDatabaseException& e)
	{
		MessageBoxW(e.GetMessageW().c_str());
	}
}


VizRailCore::Point2D CVizRailUiDlg::MileageToCoordinate(const VizRailCore::Mileage mileage)
{
	if (mileage < 0)
	{
		throw std::invalid_argument("里程值不能为负数");
	}
	for (const auto& [key, value] : _xys)
	{
		if (value->IsOnIt(mileage))
		{
			const VizRailCore::Point2D coordinate = value->MileageToCoordinate(mileage);
			return coordinate;
		}
	}
	throw NotInLineException(L"该里程不在线路上");
}

void CVizRailUiDlg::OnBnClickedButton4()
{
	if (_xys.empty())
	{
		MessageBoxW(L"请先读取数据库");
		return;
	}
	CString temp;
	_mileageInput.GetWindowTextW(temp);
	try
	{
		const double mileageValue = std::stod(temp.GetString());
		const VizRailCore::Mileage mileage(mileageValue);
		const auto point = MileageToCoordinate(mileage);
		_coordinateOutput.SetWindowTextW(std::format(L"({},{})", point.X(), point.Y()).c_str());
	}
	catch (std::invalid_argument& e)
	{
		MessageBoxW(string2wstring(e.what()).c_str());
	}
	catch (std::out_of_range&)
	{
		MessageBoxW(L"输入的里程值超出double类型所能存储的最大值");
	}
	catch (NotInLineException& e)
	{
		MessageBoxW(e.GetMessageW().c_str());
	}
}

VizRailCore::Mileage CVizRailUiDlg::GetTotalMileage()
{
	return _jds[_jds.size() - 1].EndMileage;
}


void CVizRailUiDlg::OnBnClickedButton5()
{
	if (_xys.empty())
	{
		MessageBoxW(L"请先读取数据库");
		return;
	}

	std::vector<VizRailCore::Point2D> points;
	const auto totalMileage = GetTotalMileage();
	for (size_t i = 0; i < totalMileage.Value(); i++)
	{
		points.push_back(MileageToCoordinate(VizRailCore::Mileage(i)));
	}
	// 保存到csv文件
	std::fstream fs("output.csv", std::ios::out);
	fs.setf(std::ios::fixed);
	fs.precision(6);
	fs << "N,E\n";
	for (const auto& point : points)
	{
		fs << point.X() << "," << point.Y() << "\n";
	}
}


void CVizRailUiDlg::OnNMDblclkList2(NMHDR* pNMHDR, LRESULT* pResult)
{
	LPNMITEMACTIVATE pNMItemActivate = reinterpret_cast<LPNMITEMACTIVATE>(pNMHDR);
	const int nItem = pNMItemActivate->iItem;
	if (nItem != -1)
	{
		const CString strN = _jdListCtrl.GetItemText(nItem, 1);
		const CString strE = _jdListCtrl.GetItemText(nItem, 2);
		const CString strRadius = _jdListCtrl.GetItemText(nItem, 4);
		const CString strLs = _jdListCtrl.GetItemText(nItem, 5);
		Jd jd;
		jd.N = std::stod(strN.GetString());
		jd.E = std::stod(strE.GetString());
		jd.R = std::stod(strRadius.GetString());
		jd.Ls = std::stod(strLs.GetString());
		EditJdDlg dlg(jd, this);
		if (dlg.DoModal() == IDOK)
		{
			_jdListCtrl.SetItemText(nItem, 1, std::format(L"{}", dlg._jdData.N).c_str());
			_jdListCtrl.SetItemText(nItem, 2, std::format(L"{}", dlg._jdData.E).c_str());
			_jdListCtrl.SetItemText(nItem, 4, std::format(L"{}", dlg._jdData.R).c_str());
			_jdListCtrl.SetItemText(nItem, 5, std::format(L"{}", dlg._jdData.Ls).c_str());
		}
	}
	*pResult = 0;
}

void CVizRailUiDlg::RefreshJdsAndXys()
{
	const auto count = _jdListCtrl.GetItemCount();
	_jds.clear();
	std::vector<Jd> tempJds;
	for (int i = 0; i < count; ++i)
	{
		const CString strJdH = _jdListCtrl.GetItemText(i, 0);
		const CString strN = _jdListCtrl.GetItemText(i, 1);
		const CString strE = _jdListCtrl.GetItemText(i, 2);
		const CString strR = _jdListCtrl.GetItemText(i, 4);
		const CString strLs = _jdListCtrl.GetItemText(i, 5);
		Jd jd;
		jd.JdH = std::stoul(strJdH.GetString());
		jd.N = std::stod(strN.GetString());
		jd.E = std::stod(strE.GetString());
		jd.R = std::stod(strR.GetString());
		jd.Ls = std::stod(strLs.GetString());
		tempJds.push_back(jd);
	}
	for (int i = 1; i < tempJds.size() - 1; ++i)
	{
		const VizRailCore::Point2D jd1 = {tempJds[i - 1].N, tempJds[i - 1].E};
		const VizRailCore::Point2D jd2 = {tempJds[i].N, tempJds[i].E};
		const VizRailCore::Point2D jd3 = {tempJds[i + 1].N, tempJds[i + 1].E};
		const VizRailCore::Curve curve(jd1, jd2, jd3, tempJds[i].R, tempJds[i].Ls);
	}
}

void CVizRailUiDlg::OnBnClickedButtonRefresh()
{
	RefreshJdsAndXys();
}
