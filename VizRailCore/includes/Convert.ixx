export module VizRailCore.Convert;
import VizRailCore.Coordinate;

export namespace VizRailCore
{
	template <typename TSrc,typename TDst>
	class IConverter
	{
		virtual ~IConverter() = default;
		virtual TDst Convert(const TSrc& src) = 0;
	};

}
