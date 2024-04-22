// VizRailUiDlg.h: 头文件
//

#pragma once
#include <map>
#include <memory>
#include <vector>

#include "Jd.h"
#include "../VizRailCore/includes/IMileageToCoordinate.h"


// CVizRailUiDlg 对话框
class CVizRailUiDlg : public CDialogEx
{
	// 构造
public:
	CVizRailUiDlg(CWnd* pParent = nullptr); // 标准构造函数

	// 对话框数据
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_VIZRAILUI_DIALOG };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX); // DDX/DDV 支持


	// 实现
protected:
	HICON m_hIcon;

	// 生成的消息映射函数
	virtual BOOL OnInitDialog();
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();
	DECLARE_MESSAGE_MAP()

public:
	afx_msg void OnBnClickedButton1();
	void JdsToXys();
	void GetJds(CString path);

private:
	CEdit _dbPathEdit;
	std::vector<Jd> _jds;
	std::map<std::wstring, std::shared_ptr<VizRailCore::IMileageToCoordinate>> _xys;

public:
	void SetJdListCtrlContent();
	void OnBnClickedButton2();
	VizRailCore::Point2D MileageToCoordinate(VizRailCore::Mileage mileage);
	//	CListBox _jdListBox;
	CListCtrl _jdListCtrl;
	CEdit _mileageInput;
	CEdit _coordinateOutput;
	afx_msg void OnBnClickedButton4();
//	CView _view;
	afx_msg VizRailCore::Mileage GetTotalMileage();
	void OnBnClickedButton5();
};
