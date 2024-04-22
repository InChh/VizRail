// ReSharper disable CppInconsistentNaming
#include "Curve.h"

#include <cmath>
#include <stdexcept>

#include "Utils.h"

using namespace VizRailCore;

Curve::Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
             const double R,
             const double Ls, const Mileage& jdMileage) :
	_jd1(jd1), _jd2(jd2), _jd3(jd3), _jdMileage(jdMileage)
{
	if (R <= 0)
	{
		throw std::invalid_argument("Radius cannot be negative or zero");
	}
	if (Ls < 0)
	{
		throw std::invalid_argument("Ls cannot be negative");
	}
	_r = R;
	_ls = Ls;
}

double Curve::m() const
{
	return _ls / 2 - std::pow(_ls, 3) / (240 * _r * _r);
}

double Curve::P() const
{
	return (_ls * _ls) / (24 * _r);
}

Angle Curve::Beta_0() const
{
	return Angle::FromRadian(_ls / 2 * _r);
}

double Curve::T_H() const
{
	Angle a = Alpha();
	if (a < Angle::Zero())
	{
		a = Angle::FromRadian(-a.Radian());
	}
	return m() + (_r + P()) * Angle::Tan((a / 2.0));
}

double Curve::L_H() const
{
	Angle a = Alpha();
	if (a < Angle::Zero())
	{
		a = Angle::FromRadian(-a.Radian());
	}

	return a.Radian() * _r + _ls;
}

Mileage Curve::K(const SpecialPoint specialPoint) const
{
	switch (specialPoint)
	{
	case SpecialPoint::ZH:
		return Mileage(_jdMileage - T_H());
	case SpecialPoint::HY:
		return K(SpecialPoint::ZH) + _ls;
	case SpecialPoint::QZ:
		return K(SpecialPoint::ZH) + L_H() / 2;
	case SpecialPoint::YH:
		return K(SpecialPoint::HY) + L_H();
	case SpecialPoint::HZ:
		return K(SpecialPoint::YH) + _ls;
	}
	throw std::invalid_argument("");
}

bool Curve::IsOnIt(const Mileage& mileage) const
{
	return mileage >= K(SpecialPoint::ZH) && mileage <= K(SpecialPoint::HZ);
}

bool Curve::IsRightTurn() const
{
	return Alpha() > Angle::Zero();
}

Mileage Curve::CalculateDistance(const Mileage& mileage, const PointLocation pointLocation) const
{
	Mileage li = 0.0;
	if (pointLocation == PointLocation::ZH2HY || pointLocation == PointLocation::HY2QZ)
	{
		// 在曲线前半段，计算点到ZH点的距离
		li = mileage - K(SpecialPoint::ZH);
	}
	else if (pointLocation == PointLocation::QZ2YH || pointLocation == PointLocation::YH2HZ)
	{
		// 在曲线后半段，计算点到HZ点的距离
		li = K(SpecialPoint::HZ) - mileage;
	}
	return li;
}

Point2D Curve::CalculateLocalCoordinate(const Mileage& li, const Curve::PointLocation pointLocation) const
{
	double xi = 0.0;
	double yi = 0.0;
	switch (pointLocation)
	{
	// 在缓和曲线上，利用缓和曲线公式计算局部坐标
	case PointLocation::ZH:
	case PointLocation::ZH2HY:
	case PointLocation::HY:
	case PointLocation::YH:
	case PointLocation::YH2HZ:
	case PointLocation::HZ:
		{
			xi = li.Value() - std::pow(li.Value(), 5) / (40 * _r * _r * _ls * _ls);
			yi = std::pow(li.Value(), 3) / (6 * _r * _ls);
			break;
		}
	// 在圆曲线上，利用圆曲线公式计算局部坐标
	case PointLocation::HY2QZ:
	case PointLocation::QZ:
	case PointLocation::QZ2YH:
		{
			const double phi = (li.Value() - 0.5 * _ls) / _r;
			xi = m() + _r * std::sin(phi);
			yi = P() + _r * (1 - std::cos(phi));
			break;
		}
	default:
		break;
	}
	return {xi, yi};
}

Point2D Curve::MileageToCoordinate(const Mileage& mileage) const
{
	const PointLocation pointLocation = GetPointLocation(mileage);
	if (pointLocation == PointLocation::NotInCurve)
	{
		throw std::invalid_argument("mileage is not in this curve");
	}

	// 计算局部坐标

	const Mileage li = CalculateDistance(mileage, pointLocation);
	Point2D local = CalculateLocalCoordinate(li, pointLocation);

	// 计算ZH、HZ点坐标
	const Angle aZH = GetAzimuthAngle(_jd1, _jd2);
	const Angle aHZ = GetAzimuthAngle(_jd3, _jd2);
	const Point2D HZ = {_jd2.X() - T_H() * Angle::Cos(aHZ), _jd2.Y() - T_H() * Angle::Sin(aHZ)};
	const Point2D ZH = {_jd2.X() - T_H() * Angle::Cos(aZH), _jd2.Y() - T_H() * Angle::Sin(aZH)};

	if (!IsRightTurn())
	{
		local.SetY(-local.Y());
	}

	// 计算全局坐标
	double x = 0.0;
	double y = 0.0;
	switch (pointLocation)
	{
	case PointLocation::ZH:
		return ZH;
	case PointLocation::ZH2HY:
	case PointLocation::HY:
	case PointLocation::HY2QZ:
	case PointLocation::QZ:
		x = ZH.X() + local.X() * Angle::Cos(aZH) - local.Y() * Angle::Sin(aZH);
		y = ZH.Y() + local.X() * Angle::Sin(aZH) + local.Y() * Angle::Cos(aZH);
		break;
	case PointLocation::QZ2YH:
	case PointLocation::YH:
	case PointLocation::YH2HZ:
		x = HZ.X() + local.X() * Angle::Cos(aHZ) + local.Y() * Angle::Sin(aHZ);
		y = HZ.Y() + local.X() * Angle::Sin(aHZ) - local.Y() * Angle::Cos(aHZ);
		break;
	case PointLocation::HZ:
		return HZ;
	default:
		break;
	}

	return {x, y};
}

Angle Curve::Alpha() const
{
	auto [dx1, dy1] = _jd2 - _jd1;
	auto [dx2, dy2] = _jd3 - _jd2;

	const Angle azimuthAngle1 = GetAzimuthAngle(dx1, dy1);
	const Angle azimuthAngle2 = GetAzimuthAngle(dx2, dy2);
	return Angle::FromDegree(std::fmod((azimuthAngle2 - azimuthAngle1).Degree(), 360.0));
}

Curve::PointLocation Curve::GetPointLocation(const Mileage& mileage) const
{
	if (mileage == K(SpecialPoint::ZH))
	{
		return PointLocation::ZH;
	}

	if (mileage == K(SpecialPoint::HY))
	{
		return PointLocation::HY;
	}

	if (mileage == K(SpecialPoint::QZ))
	{
		return PointLocation::QZ;
	}

	if (mileage == K(SpecialPoint::YH))
	{
		return PointLocation::YH;
	}

	if (mileage == K(SpecialPoint::HZ))
	{
		return PointLocation::HZ;
	}

	if (mileage > K(SpecialPoint::ZH) && mileage < K(SpecialPoint::HY))
	{
		return PointLocation::ZH2HY;
	}

	if (mileage > K(SpecialPoint::HY) && mileage < K(SpecialPoint::QZ))
	{
		return PointLocation::HY2QZ;
	}

	if (mileage > K(SpecialPoint::QZ) && mileage < K(SpecialPoint::YH))
	{
		return PointLocation::QZ2YH;
	}

	if (mileage > K(SpecialPoint::YH) && mileage < K(SpecialPoint::HZ))
	{
		return PointLocation::YH2HZ;
	}

	return PointLocation::NotInCurve;
}
