#include "stdafx.h"
#include "Utils.h"
#include <cmath>

void SetView(AcGePoint2d pt1, AcGePoint2d pt2, const double exRatio)
{
	AcGePoint2d centerPt;
	if ((std::fabs(pt1.x - pt2.x) < 1e-6) || (std::fabs(pt1.y - pt2.y) < 1e-6))
	{
		return;
	}

	//确保两个坐标点分别为左上角和右下角
	if (pt1.x > pt2.x)
	{
		const double tmp = pt1.x;
		pt1.x = pt2.x;
		pt2.x = tmp;
	}
	if (pt2.y > pt1.y)
	{
		const double tmp = pt1.y;
		pt1.y = pt2.y;
		pt2.y = tmp;
	}

	//获取当前DwgView的尺寸
	CRect rect;
	acedGetAcadDwgView()->GetClientRect(&rect);
	double width, height;
	const double ratio = static_cast<double>(rect.right - rect.left) / static_cast<double>(rect.bottom - rect.top);
	if (std::fabs(ratio) < 1e-6)
	{
		return;
	}
	if ((pt2.x - pt1.x) / (pt1.y - pt2.y) > ratio)
	{
		width = pt2.x - pt1.x;
		height = width / ratio;
	}
	else
	{
		height = pt1.y - pt2.y;
		width = height * ratio;
	}

	//设置当前视图中心点
	centerPt.x = (pt1.x + pt2.x) / 2;
	centerPt.y = (pt1.y + pt2.y) / 2;

	//改变当前视图
	AcDbViewTableRecord pVwRec;
	pVwRec.setCenterPoint(centerPt);
	pVwRec.setWidth(width * exRatio);
	pVwRec.setHeight(height * exRatio);
	acedSetCurrentView(&pVwRec, nullptr);
}
