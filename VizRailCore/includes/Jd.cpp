#include "Jd.h"
#include <cmath>

double Jd::Distance(const Jd& jd1, const Jd& jd2)
{
	const double dx = jd1.N - jd2.N;
	const double dy = jd1.E - jd2.E;
	return std::sqrt(dx * dx + dy * dy);
}
