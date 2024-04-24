#pragma once
#include <map>
#include <memory>
#include <string>
#include <vector>

#include "Jd.h"
#include "LineElement.h"

namespace VizRailCore
{
	class PlaneLine
	{
	public:
		PlaneLine() = default;
		explicit PlaneLine(const std::vector<Jd>& jds);

		void AddJd(const Jd& jd);

		void RemoveJd(const std::vector<Jd>::difference_type index);

		void InsertJd(std::vector<Jd>::difference_type index, const Jd& jd);

		void UpdateJd(size_t index, const Jd& jd);

		void Refresh();

	private:
		std::vector<Jd> _jds;
		std::map<std::wstring, std::shared_ptr<LineElement>> _xys;

		void RefreshXys();
	};
}
