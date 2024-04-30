#include "HorizontalAlignment.h"

#include <execution>
#include <format>

#include "Curve.h"
#include "Exceptions.h"
#include "IntermediateLine.h"

using namespace VizRailCore;

HorizontalAlignment::HorizontalAlignment(const std::vector<Jd>& jds): _jds(jds)
{
	Refresh();
}

void HorizontalAlignment::AddJd(const Jd& jd)
{
	_jds.push_back(jd);
	Refresh();
}

void HorizontalAlignment::AddJd(const std::vector<Jd>& jds)
{
	_jds.insert(_jds.cend(), jds.cbegin(), jds.cend());
	Refresh();
}

void HorizontalAlignment::RemoveJd(const std::vector<Jd>::difference_type index)
{
	_jds.erase(_jds.begin() + index);
	Refresh();
}

void HorizontalAlignment::InsertJd(const std::vector<Jd>::difference_type index, const Jd& jd)
{
	_jds.insert(_jds.cbegin() + index, jd);
	Refresh();
}

void HorizontalAlignment::UpdateJd(const size_t index, const Jd& jd)
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

void HorizontalAlignment::Refresh()
{
	_xys.clear();
	RefreshXys();
}

Point2D HorizontalAlignment::MileageToCoordinate(const Mileage& mileage) const
{
	if (mileage < 0)
	{
		throw VizRailCoreException(L"里程值不能为负数");
	}
	for (const auto& [key, value] : _xys)
	{
		if (value->IsOnIt(mileage))
		{
			const Point2D coordinate = value->MileageToCoordinate(mileage);
			return coordinate;
		}
	}
	throw NotInLineException(L"该里程不在线路上");
}

double HorizontalAlignment::GetTotalMileage() const
{
	return std::reduce(_xys.cbegin(), _xys.cend(), 0.0,
	                   [](const double sum, const std::pair<std::wstring, std::shared_ptr<LineElement>>& pair)
	                   {
		                   return sum + pair.second->Length();
	                   });
}

void HorizontalAlignment::RefreshXys()
{
	// 计算所有交点里程
	std::vector<double> jdMileages;
	for (size_t i = 0; i < _jds.size(); ++i)
	{
		if (i == 0)
		{
			jdMileages.push_back(_jds[0].StartMileage);
		}
		else
		{
			jdMileages.push_back(jdMileages[i - 1] + Jd::Distance(_jds[i], _jds[i - 1]));
		}
	}

	if (_jds.size() > 2)
	{
		// 交点数大于2时，构造曲线和夹直线对象

		unsigned int jzxCount = 0;
		unsigned int curveCount = 0;
		size_t i = 1;
		for (; i < _jds.size() - 1; ++i)
		{
			// 遍历交点序列（除了第一个和最后一个交点），分别构造曲线和当前曲线的前一个夹直线
			Point2D jd1 = {_jds[i - 1].E, _jds[i - 1].N};
			Point2D jd2 = {_jds[i].E, _jds[i].N};
			Point2D jd3 = {_jds[i + 1].E, _jds[i + 1].N};
			// 构造曲线对象
			++curveCount;
			const double r = _jds[i].R;
			const double ls = _jds[i].Ls;
			auto curve = std::make_shared<Curve>(jd1, jd2, jd3, r, ls, jdMileages[i]);

			const auto th = curve->T_H();
			const auto lh = curve->L_H();
			_jds[i].StartMileage = jdMileages[i] - th;
			_jds[i].EndMileage = jdMileages[i] + th;
			_jds[i].TH = th;
			_jds[i].LH = lh;

			std::wstring key = std::format(L"曲线{}", curveCount);
			_xys.insert_or_assign(key, curve);
			_xysOrder.emplace_back(key);

			// 构造夹直线对象
			++jzxCount;
			double jzxStartMileage = 0.0;
			Point2D startPoint;
			if (jzxCount == 1)
			{
				// 第一条夹直线的起点为第一个交点
				startPoint = Point2D{_jds[i - 1].E, _jds[i - 1].N};
				// 第一条夹直线的起点里程为第一个交点里程
				jzxStartMileage = jdMileages[i - 1];
			}
			else
			{
				// 不是第一条夹直线时，起点为上一条曲线的HZ点
				const auto lastCurve = std::dynamic_pointer_cast<Curve>(
					_xys.at(std::format(L"曲线{}", curveCount - 1)));
				startPoint = lastCurve->SpecialPointCoordinate(SpecialPoint::HZ);
				// 不是第一条夹直线时，起点里程为上一条曲线的HZ点里程
				jzxStartMileage = lastCurve->K(SpecialPoint::HZ).Value();
			}

			// 不是最后一条夹直线时，终点里程为当前曲线的ZH点里程
			const double jzxEndMileage = curve->K(SpecialPoint::ZH).Value();

			// 不是最后一条夹直线时，终点为当前曲线的ZH点
			const Point2D endPoint = curve->SpecialPointCoordinate(SpecialPoint::ZH);

			auto jzx = std::make_shared<IntermediateLine>(
				startPoint, jzxStartMileage, endPoint, jzxEndMileage);
			key = std::format(L"夹直线{}", jzxCount);
			_xys.insert_or_assign(key, jzx);
			_xysOrder.emplace_back(key);
		}

		// 构造最后一条夹直线，起点为最后一条曲线的HZ点，终点为最后一个交点，起点里程为最后一条曲线的HZ点里程，
		// 终点里程为最后一条曲线的HZ点里程加直线长
		const auto lastCurve = std::dynamic_pointer_cast<Curve>(
			_xys.at(std::format(L"曲线{}", curveCount)));
		const Point2D startPoint = lastCurve->SpecialPointCoordinate(SpecialPoint::HZ);
		const Point2D endPoint = {_jds[i].E, _jds[i].N};
		const double startMileage = lastCurve->K(SpecialPoint::HZ).Value();
		const double endMileage = startMileage + Point2D::Distance(startPoint, endPoint);
		auto jzx = std::make_shared<IntermediateLine>(
			startPoint, startMileage, endPoint, endMileage);
		_jds[i].StartMileage = endMileage;
		_jds[i].EndMileage = endMileage;
		const auto key = std::format(L"夹直线{}", jzxCount + 1);
		_xys.insert_or_assign(key, jzx);
		_xysOrder.emplace_back(key);
	}
	// 只有两个交点时，只构造一个夹直线对象，起点和终点分别为两个交点
	if (_jds.size() == 2)
	{
		VizRailCore::Point2D jd1 = {_jds[0].E, _jds[0].N};
		const double startMileage = jdMileages[0];
		VizRailCore::Point2D jd2 = {_jds[1].E, _jds[1].N};
		const double endMileage = jdMileages[1];
		auto jzx = std::make_shared<VizRailCore::IntermediateLine>(jd1, startMileage, jd2, endMileage);
		_xys.insert_or_assign(L"夹直线1", jzx);
	}
}
