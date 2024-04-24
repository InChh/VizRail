#include "PlaneLine.h"

#include <format>

#include "Curve.h"
#include "Exceptions.h"
#include "IntermediateLine.h"

using namespace VizRailCore;

PlaneLine::PlaneLine(const std::vector<Jd>& jds): _jds(jds)
{
	Refresh();
}

void PlaneLine::AddJd(const Jd& jd)
{
	_jds.push_back(jd);
	Refresh();
}

void PlaneLine::RemoveJd(const std::vector<Jd>::difference_type index)
{
	_jds.erase(_jds.begin() + index);
	Refresh();
}

void PlaneLine::InsertJd(const std::vector<Jd>::difference_type index, const Jd& jd)
{
	_jds.insert(_jds.cbegin() + index, jd);
	Refresh();
}

void PlaneLine::UpdateJd(const size_t index, const Jd& jd)
{
	try
	{
		_jds.at(index) = jd;
		Refresh();
	}
	catch (std::out_of_range&)
	{
		throw VizRailCoreException(L"交点索引超出范围");
	}
}

void PlaneLine::Refresh()
{
}

void PlaneLine::RefreshXys()
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
