// ReSharper disable CppInconsistentNaming
#pragma once

#include "Coordinate.h"
#include "Angle.h"
#include "LineElement.h"
#include "Mileage.h"

namespace VizRailCore
{
	enum class SpecialPoint
	{
		ZH,
		HY,
		QZ,
		YH,
		HZ,
	};

	/// 曲线类，代表由三个交点确定的带缓和曲线的圆曲线，使用3个交点和曲线半径R、缓和曲线长Ls构造曲线对象后，可计算曲线要素和里程
	class Curve final : public LineElement
	{
	public:
		Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
		      const double R,
		      const double Ls, const Mileage& jdMileage = Mileage(0));

		[[nodiscard]] Point2D Jd1() const
		{
			return _jd1;
		}

		void SetJd1(const Point2D& jd1)
		{
			_jd1 = jd1;
		}

		[[nodiscard]] Point2D Jd2() const
		{
			return _jd2;
		}

		void SetJd2(const Point2D& jd2)
		{
			_jd2 = jd2;
		}

		[[nodiscard]] Point2D Jd3() const
		{
			return _jd3;
		}

		void SetJd3(const Point2D& jd3)
		{
			_jd3 = jd3;
		}

		void SetR(const double r)
		{
			_r = r;
		}

		void SetLs(const double ls)
		{
			_ls = ls;
		}

		[[nodiscard]] Mileage JdMileage() const
		{
			return _jdMileage;
		}

		void SetJdMileage(const Mileage& mileage)
		{
			_jdMileage = mileage;
		}

		[[nodiscard]] double R() const
		{
			return _r;
		}

		[[nodiscard]] double Ls() const
		{
			return _ls;
		}

		[[nodiscard]] Angle Alpha() const;

		[[nodiscard]] double m() const;

		[[nodiscard]] double P() const;

		[[nodiscard]] Angle Beta_0() const;

		[[nodiscard]] double T_H() const;

		[[nodiscard]] double L_H() const;


		/// \brief 特殊点（直缓点，缓圆点，曲中点，圆缓点，缓直点）转里程
		/// \param specialPoint 特殊点类型
		/// \param Kjd2 交点2里程
		/// \return 里程
		[[nodiscard]] Mileage K(SpecialPoint specialPoint) const;

		bool IsOnIt(const Mileage& mileage) const override;

		bool IsRightTurn() const;

		Point2D MileageToCoordinate(const Mileage& mileage) const override;

		Point2D SpecialPointCoordinate(SpecialPoint specialPoint) const;

	private:
		Point2D _jd1;
		Point2D _jd2;
		Point2D _jd3;
		double _r;
		double _ls;
		Mileage _jdMileage;

		enum class PointLocation
		{
			Before,
			ZH,
			ZH2HY,
			HY,
			HY2QZ,
			QZ,
			QZ2YH,
			YH,
			YH2HZ,
			HZ,
			After,
			NotInCurve,
		};

		PointLocation GetPointLocation(const Mileage& mileage) const;
		Mileage CalculateDistance(const Mileage& mileage,
		                          PointLocation pointLocation) const;
		Point2D CalculateLocalCoordinate(const Mileage& li, PointLocation pointLocation) const;
	};
}
