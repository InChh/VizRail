// ReSharper disable CppInconsistentNaming
#include "Curve.h"

#include <cmath>
#include <stdexcept>

using namespace VizRailCore;

Curve::Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
             const double R,
             const double Ls) :
	_jd1(jd1), _jd2(jd2), _jd3(jd3)
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
	return m() + (_r + P()) * std::tan((Alpha() / 2.0).Radian());
}

double Curve::L_H() const
{
	return Alpha().Radian() * _r + _ls;
}

Mileage Curve::K(const SpecialPoint specialPoint, const Mileage& Kjd2) const
{
	switch (specialPoint)
	{
	case SpecialPoint::ZH:
		return Mileage(Kjd2 - T_H());
	case SpecialPoint::HY:
		return K(SpecialPoint::ZH, Kjd2) + _ls;
	case SpecialPoint::QZ:
		return K(SpecialPoint::ZH, Kjd2) + L_H() / 2;
	case SpecialPoint::YH:
		return K(SpecialPoint::HY, Kjd2) + L_H();
	case SpecialPoint::HZ:
		return K(SpecialPoint::YH, Kjd2) + _ls;
	}
	throw std::invalid_argument("");
}

Angle Curve::Alpha() const
{
	auto [dx1, dy1] = _jd2 - _jd1;
	auto [dx2, dy2] = _jd3 - _jd2;

	const Angle azimuthAngle1 = GetAzimuthAngle(dx1, dy1);
	const Angle azimuthAngle2 = GetAzimuthAngle(dx2, dy2);
	return Angle::FromDegree(std::fmod((azimuthAngle2 - azimuthAngle1).Degree(), 360.0));
}

Angle VizRailCore::GetAzimuthAngle(const double dx, const double dy)
{
	if (std::abs(dx - 0.0) < std::numeric_limits<double>::epsilon())
	{
		if (dy > 0)
		{
			return Angle::Pi() / 2;
		}

		if (dy < 0)
		{
			return Angle::Pi() * 3 / 2;
		}

		throw std::invalid_argument("dx and dy cannot be both zero");
	}

	const Angle theta = Angle::FromRadian(std::atan2(std::abs(dy), std::abs(dx)));
	Angle quadrantAngle;
	if (dx > 0 && dy > 0)
	{
		quadrantAngle = theta;
	}
	else if (dx < 0 && dy > 0)
	{
		quadrantAngle = Angle::Pi() - theta;
	}
	else if (dx > 0 && dy < 0)
	{
		quadrantAngle = Angle::TwoPi() - theta;
	}
	else if (dx < 0 && dy < 0)
	{
		quadrantAngle = Angle::Pi() + theta;
	}
	return quadrantAngle;
}
