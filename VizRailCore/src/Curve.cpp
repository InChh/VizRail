// ReSharper disable CppInconsistentNaming
#include "Curve.h"

#include <cmath>
#include <stdexcept>

using namespace VizRailCore;

Curve::Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
             const double R,
             const double Ls) :
	_jd1(jd1), _jd2(jd2), _jd3(jd3),
	_r(R), _ls(Ls)
{
	CalculateSteeringAngle();
}

double Curve::m() const
{
	return _ls / 2 - std::pow(_ls, 3) / (240 * _r * _r);
}

double Curve::P() const
{
	return (_ls * _ls) / (24 * _r);
}

Angle Curve::beta_0() const
{
	return Angle::FromRadian(_ls / 2 * _r);
}

double Curve::T_H() const
{

}

double Curve::L_H() const
{
}

void Curve::CalculateSteeringAngle()
{
	auto [dx1, dy1] = _jd2 - _jd1;
	auto [dx2, dy2] = _jd3 - _jd2;

	const Angle azimuthAngle1 = GetAzimuthAngle(dx1, dy1);
	const double d1 = azimuthAngle1.Degree();
	const Angle azimuthAngle2 = GetAzimuthAngle(dx2, dy2);
	const double d2 = azimuthAngle2.Degree();
	_alpha = Angle::FromDegree(std::fmod((azimuthAngle2 - azimuthAngle1).Degree(), 360.0));
}

Angle VizRailCore::GetAzimuthAngle(const double dx, const double dy)
{
	if (dx == 0)
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
	// ÇóÏóÏÞ½Ç
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
