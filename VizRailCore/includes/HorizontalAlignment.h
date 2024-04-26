#pragma once
#include <map>
#include <memory>
#include <string>
#include <vector>

#include "Jd.h"
#include "LineElement.h"

namespace VizRailCore
{
	class HorizontalAlignment
	{
	public:
		HorizontalAlignment() = default;
		explicit HorizontalAlignment(const std::vector<Jd>& jds);

		void AddJd(const Jd& jd);
		void AddJd(const std::vector<Jd>& jds);

		void RemoveJd(const std::vector<Jd>::difference_type index);

		void InsertJd(std::vector<Jd>::difference_type index, const Jd& jd);

		void UpdateJd(size_t index, const Jd& jd);

		[[nodiscard]] const std::vector<Jd>& GetJds() const
		{
			return _jds;
		}

		void Refresh();

		[[nodiscard]] Point2D MileageToCoordinate(const Mileage& mileage) const;

		[[nodiscard]] double GetTotalMileage() const;

	private:
		std::vector<Jd> _jds;
		std::map<std::wstring, std::shared_ptr<LineElement>> _xys;

		void RefreshXys();
	};
}
