#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "Coordinate.h"
#include "Curve.h"

using namespace VizRailCore;
using namespace Catch;

TEST_CASE("TestCurveCreation", "[Curve]")
{
	const Point2D jd1 = {0.0, 0.0};
	const Point2D jd2 = {100.0, 100.0};
	const Point2D jd3 = {0.0, 200.0};
	const Point2D jd4 = {0.0, 0.0};
	const Point2D jd5 = {100.0, 0.0};
	const Point2D jd6 = {200.0, 0.0};
	const Point2D jd7 = {0.0, 0.0};
	const Point2D jd8 = {0.0, 100.0};
	const Point2D jd9 = {0.0, 200.0};

	const Curve curve(jd1, jd2, jd3, 10.0, 1.0);
	const Curve curve2(jd4, jd5, jd6, 10.0, 1.0);
	const Curve curve3(jd7, jd8, jd9, 10.0, 1.0);
	const Curve curve4(jd1, jd5, jd2, 10.0, 1.0);

	SECTION("TestCurveSteeringAngle")
	{
		REQUIRE(curve.Alpha().Degree() == Approx(90.0));
		REQUIRE(curve2.Alpha().Degree() == Approx(0.0));
		REQUIRE(curve3.Alpha().Degree() == Approx(0.0));
		REQUIRE(curve4.Alpha().Degree() == Approx(90.0));
	}
}

TEST_CASE("CurveCalculationShouldCorrect", "[Curve]")
{
	const Point2D jd1 = {3342247.107195, 507118.139447};
	const Point2D jd2 = {3339134.96392, 503688.185001};
	const Point2D jd3 = {3330609.751766, 483014.208169};
	const Point2D jd4 = {3331514.645487, 470764.921972};
	const Point2D jd5 = {3335628.27, 468474.95};
	const Curve curve1(jd1, jd2, jd3, 10000.0, 590.0);
	const Curve curve2(jd2, jd3, jd4, 10000.0, 590.0);
	const Curve curve3(jd3, jd4, jd5, 8000.0, 590.0);
	REQUIRE(curve1.T_H() == Approx(2041.358966));
	REQUIRE(curve1.L_H() == Approx(4047.372303));
	REQUIRE(curve2.T_H() == Approx(2662.409588));
	REQUIRE(curve2.L_H() == Approx(5238.589326));
	REQUIRE(curve3.T_H() == Approx(4609.938612));
	REQUIRE(curve3.L_H() == Approx(8502.798779));
}
